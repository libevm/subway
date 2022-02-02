import { ethers } from "ethers";
import { uniswapV2Pair } from "./constants.js";
import { match } from "./utils.js";

/* 
  Sorts tokens
*/
export const sortTokens = (tokenA, tokenB) => {
  if (ethers.BigNumber.from(tokenA).lt(ethers.BigNumber.from(tokenB))) {
    return [tokenA, tokenB];
  }
  return [tokenB, tokenA];
};

/*
  Computes pair addresses off-chain
*/
export const getUniv2PairAddress = (tokenA, tokenB) => {
  const [token0, token1] = sortTokens(tokenA, tokenB);

  const salt = ethers.utils.keccak256(token0 + token1.replace("0x", ""));
  const address = ethers.utils.getCreate2Address(
    "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", // Factory address (contract creator)
    salt,
    "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f" // init code hash
  );

  return address;
};

/*
  Get reserve helper function
*/
export const getUniv2Reserve = async (pair, tokenA, tokenB) => {
  const [token0] = sortTokens(tokenA, tokenB);
  const [reserve0, reserve1] = await uniswapV2Pair.attach(pair).getReserves();

  if (match(tokenA, token0)) {
    return [reserve0, reserve1];
  }
  return [reserve1, reserve0];
};

/*
 Uniswap v2; x * y = k formula

 How much out do we get if we supply in?
*/
export const getUniv2DataGivenIn = (aIn, reserveA, reserveB) => {
  const aInWithFee = aIn.mul(997);
  const numerator = aInWithFee.mul(reserveB);
  const denominator = aInWithFee.add(reserveA.mul(1000));
  const bOut = numerator.div(denominator);

  // Underflow
  let newReserveB = reserveB.sub(bOut);
  if (newReserveB.lt(0) || newReserveB.gt(reserveB)) {
    newReserveB = ethers.BigNumber.from(1);
  }

  // Overflow
  let newReserveA = reserveA.add(aIn);
  if (newReserveA.lt(reserveA)) {
    newReserveA = ethers.constants.MaxInt256;
  }

  return {
    amountOut: bOut,
    newReserveA,
    newReserveB,
  };
};

/*
 Uniswap v2; x * y = k formula

 How much in do we get if we supply out?
*/
export const getUniv2DataGivenOut = (bOut, reserveA, reserveB) => {
  // Underflow
  let newReserveB = reserveB.sub(bOut);
  if (newReserveB.lt(0) || reserveB.gt(reserveB)) {
    newReserveB = ethers.BigNumber.from(1);
  }

  const numerator = reserveA.mul(bOut).mul(1000);
  const denominator = newReserveB.mul(997);
  const aAmountIn = numerator.div(denominator).add(ethers.constants.One);

  // Overflow
  let newReserveA = reserveA.add(aAmountIn);
  if (newReserveA.lt(reserveA)) {
    newReserveA = ethers.constants.MaxInt256;
  }

  return {
    amountIn: aAmountIn,
    newReserveA,
    newReserveB,
  };
};

/*
  Given a finalMinRecv BigNumber and a path of tokens (string), compute the
  minRecv immediately after WETH.

  Basically, calculates how much the user is willing to accept as a min output,
  but specifically tailored for the token after WETH.

  We do this as Univ2 router swaps can swap over "paths". In this example, we're only doing
  WETH <> TOKEN sandwiches. Thus, we only care about the minRecv for the path DIRECTLY AFTER WETH
*/
export const getUniv2ExactWethTokenMinRecv = async (finalMinRecv, path) => {
  let userMinRecv = finalMinRecv;

  // Only works for swapExactETHForTokens

  // Computes lowest amount of token (directly after WETH)
  for (let i = path.length - 1; i > 1; i--) {
    const fromToken = path[i - 1];
    const toToken = path[i];

    const pair = getUniv2PairAddress(fromToken, toToken);
    const [reserveFrom, reserveTo] = await getUniv2Reserve(
      pair,
      fromToken,
      toToken
    );

    const newReserveData = await getUniv2DataGivenOut(
      userMinRecv,
      reserveFrom,
      reserveTo
    );
    userMinRecv = newReserveData.amountIn;
  }

  return userMinRecv;
};
