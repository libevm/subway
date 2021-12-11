// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./lib/test.sol";

import "../interface/IWETH.sol";
import "../interface/IERC20.sol";
import "../interface/IUniswapV2.sol";

import "../Sandwich.sol";

contract SandwichTest is DSTest {
    Sandwich sandwich;

    IWETH weth = IWETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    IERC20 usdc = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    IUniswapV2Pair wethUsdcPair;

    IUniswapV2Router02 univ2Router =
        IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    IUniswapV2Factory univ2Factory =
        IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);

    function setUp() public {
        sandwich = new Sandwich(address(this));
        weth.deposit{value: 10e18}();
        weth.transfer(address(sandwich), 5e18);
        weth.approve(address(univ2Router), type(uint256).max);

        wethUsdcPair = IUniswapV2Pair(
            univ2Factory.getPair(address(weth), address(usdc))
        );
    }

    function test_sandwich_frontslice_router() public {
        address[] memory path = new address[](2);
        path[0] = address(weth);
        path[1] = address(usdc);

        uint256 _before = gasleft();
        univ2Router.swapExactTokensForTokens(
            1e18,
            0,
            path,
            address(this),
            block.timestamp + 100
        );
        uint256 _after = gasleft();

        emit log_string("router front slice gas used");
        emit log_uint(_before - _after);
    }

    function test_sandwich_frontslice_optimized() public {
        address[] memory path = new address[](2);
        path[0] = address(weth);
        path[1] = address(usdc);

        // Get amounts out
        uint256 amountIn = 1e18;
        uint256 amountOut = univ2Router.getAmountsOut(amountIn, path)[1];
        uint8 tokenOutNo = address(usdc) < address(weth) ? 0 : 1;

        bytes memory payload = abi.encodePacked(
            address(weth), // token we're giving
            address(wethUsdcPair), // univ2 pair
            uint128(amountIn), // amountIn
            uint128(amountOut), // amountOut
            tokenOutNo
        );

        uint256 _before = gasleft();
        (bool s, ) = address(sandwich).call(payload);
        uint256 _after = gasleft();
        assertTrue(s);

        emit log_string("optimized front slice gas used");
        emit log_uint(_before - _after);
    }

    function test_sandwich_permissions() public {
        Sandwich psandwich = new Sandwich(address(0));

        address[] memory path = new address[](2);
        path[0] = address(weth);
        path[1] = address(usdc);

        // Get amounts out
        uint256 amountIn = 1e18;
        uint256 amountOut = univ2Router.getAmountsOut(amountIn, path)[1];
        uint8 tokenOutNo = address(usdc) < address(weth) ? 0 : 1;

        bytes memory payload = abi.encodePacked(
            address(weth), // token we're giving
            address(wethUsdcPair), // univ2 pair
            uint128(amountIn), // amountIn
            uint128(amountOut), // amountOut
            tokenOutNo
        );

        (bool s, ) = address(psandwich).call(payload);
        assertTrue(s == false);
    }
}
