# Subway Sandwich Contracts

Uses [dapp.tools](https://dapp.tools/)

## Overview

This is a set highly optimized contracts that can be used front and back slices in a UniswapV2 [sandwich attack](https://medium.com/coinmonks/defi-sandwich-attack-explain-776f6f43b2fd).

For a sandwich front/back slice, there is only so much optimization that can be done on your contracts. This repository currently includes:

- Avoid using `SLOAD` for owner checking
- Compact payload construction
- Manual memory pointer construction
- Catch-all function signatures
- ....

**NOTE: Please be aware that this repository does NOT provide protection against [Uncle Bandit attacks](https://twitter.com/bertcmiller/status/1385294417091760134)**

## Gas Usage

![](https://i.imgur.com/5AQQbns.png)

| Single Swap                       | Gas Used |
| --------------------------------- | -------- |
| Univ2 Router                      | 109809   |
| Solidity Inline Assembly Contract | 92422    |
| Yulp Contracts                    | 92234    |

## Development

You'll need [NodeJS](https://nodejs.org/en/) on your machine.

[Yul+](https://fuellabs.medium.com/introducing-yul-a-new-low-level-language-for-ethereum-aa64ce89512f) contracts are first compiled via the JS compiler, then relayed to Dapptool's HEVM via [FFI](https://wiki.haskell.org/Foreign_Function_Interface). That way we can use Dapptool's testing suite alongside with Yul+.

Running the tests

```bash
# clone the repository, enter contracts directory
git clone https://github.com/libevm/subway.git
cd subway/contracts

# install dependencies (for yulp and ffi support)
yarn

# run the tests (requires a Ethereum Node)
# use Infura as last resort
dapp test --rpc-url $RPC_URL --verbosity 2 --ffi
```
