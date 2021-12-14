# Subway

A practical example on how to perform sandwich attacks on UniswapV2 pairs.

Having highly optimized contracts is just one part of the equation, a tech stack is just as important as the contracts to execute on the opportunities.

https://user-images.githubusercontent.com/95674753/145967796-6c2c8925-fb5c-41d4-a64f-a22ce8701ce6.mp4

## Overview

The contracts are written in Yul+ and Solidity, and contains the **bare minimum** needed to perform a sandwich attack (i.e. `swap` and `transfer`). **They do NOT protect against [uncle bandit attacks](https://twitter.com/bertcmiller/status/1385294417091760134) so use at your own risk.**

The goal of this bot is to act as a low barrier of entry, reference source code for aspiring new searchers (hence, JavaScript). This bot contains:

- read from the mempool
- decode transaction data
- simple logging system
- profit calculation algos
- gas bribe calculation
- bundle firing
- misc
  - doing math in JS
  - calculating next base fee

While the bot is functional, the bot logic is a very simplistic one and does not contain a lot of the features that many advance searchers have (but not including), such as:

- circuit breakers
- poison token checker
- caching system
- robust logging system (e.g. graphana)
- various gas saving ALPHAs

As such, this bot is intended as a piece of educational content, and not for production use.
