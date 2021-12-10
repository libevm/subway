// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "./interface/IERC20.sol";
import "./lib/SafeTransfer.sol";

contract Sandwich {
    using SafeTransfer for IERC20;

    // Authorized
    address internal immutable user;

    // transfer(address,uint256)
    bytes4 internal constant ERC20_TRANSFER_ID = 0xa9059cbb;

    // swap(uint256,uint256,address,bytes)
    bytes4 internal constant PAIR_SWAP_ID = 0x022c0d9f;

    // Contructor sets the only user
    receive() external payable {}

    constructor(address _owner) {
        user = _owner;
    }

    // *** Receive profits from contract *** //
    function recoverERC20(address token) public {
        require(msg.sender == user, "shoo");
        IERC20(token).safeTransfer(
            msg.sender,
            IERC20(token).balanceOf(address(this))
        );
    }

    /*
        Fallback function where you do your frontslice and backslice

        NO UNCLE BLOCK PROTECTION IN PLACE, USE AT YOUR OWN RISK

        Payload structure (abi encodePacked)

        - token: address        - Address of the token you're swapping
        - pair: address         - Univ2 pair you're sandwiching on
        - amountIn: uint128     - Amount you're giving via swap
        - amountOut: uint128    - Amount you're receiving via swap
        - tokenOutNo: uint8     - Is the token you're giving token0 or token1? (On univ2 pair)

        Note: This fallback function generates some dangling bits
    */
    fallback() external payable {
        // Assembly cannot read immutable variables
        address memUser = user;

        assembly {
            // You can only access teh fallback function if you're authorized
            if iszero(eq(caller(), memUser)) {
                // Ohm (3, 3) makes your code more efficient
                // WGMI
                revert(3, 3)
            }

            // Extract out teh variables
            // We don't have function signatures sweet saving EVEN MORE GAS

            // bytes20
            let token := shr(96, calldataload(0x00))
            // bytes20
            let pair := shr(96, calldataload(0x14))
            // uint128
            let amountIn := shr(128, calldataload(0x28))
            // uint128
            let amountOut := shr(128, calldataload(0x38))
            // uint8
            let tokenOutNo := shr(248, calldataload(0x48))

            // **** calls token.transfer(pair, amountIn) ****

            // transfer function signature
            mstore(0x7c, ERC20_TRANSFER_ID)
            // destination
            mstore(0x80, pair)
            // amount
            mstore(0xa0, amountIn)

            let s1 := call(sub(gas(), 5000), token, 0, 0x7c, 0x44, 0, 0)
            if iszero(s1) {
                // WGMI
                revert(3, 3)
            }

            // ************
            /* 
                calls pair.swap(
                    tokenOutNo == 0 ? amountOut : 0,
                    tokenOutNo == 1 ? amountOut : 0,
                    address(this),
                    new bytes(0)
                )
            */

            // swap function signature
            mstore(0x7c, PAIR_SWAP_ID)
            // tokenOutNo == 0 ? ....
            switch tokenOutNo
            case 0 {
                mstore(0x80, amountOut)
                mstore(0xa0, 0)
            }
            case 1 {
                mstore(0x80, 0)
                mstore(0xa0, amountOut)
            }
            // address(this)
            mstore(0xc0, address())
            // empty bytes
            mstore(0xe0, 0x80)

            let s2 := call(sub(gas(), 5000), pair, 0, 0x7c, 0xa4, 0, 0)
            if iszero(s2) {
                revert(3, 3)
            }
        }
    }
}
