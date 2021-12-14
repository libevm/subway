# Subway Bot Source Code

![](https://miro.medium.com/max/1000/0*iZt4rdLLAd8F-IwQ.jpg)

## Overview

Logic inside a simple WETH <> TOKEN UniswapV2 sandwich bot

## Explainer

In every Uniswap V2 trade, the user (victim) will specify a minimum amount of output tokens they're willing to receive.

The job of the sandwich bot is to calculate how much of the output tokens they should buy (to push the price of the token up) to match the victim's minimum out requirement. This minimum out requirement on most cases will be 2%, but on extreme cases it can be as high as 20% on volatile pairs (such as the SHIBA-WETH pair during the craze).

Once the sandwich bot has calculated the optimal number of tokens to buy, it'll wait for the victim to buy their tokens, and immediately sell to gain a profit.

## Running the bot

Create a `.env` file, referencing `.env.example` (you'll need to deploy a sandwich contract from the contracts repository, doesn't matter Yul+ or Solidity, either is fine)

```bash
yarn bot
```

And you should be good to go


## Tests

No tests. Test in prod. Something, something Zuck, move fast, break things, lose all your ETH.