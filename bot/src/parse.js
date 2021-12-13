import { createRequire } from "module";
const require = createRequire(import.meta.url);

import abiDecoder from "abi-decoder";
const IUniswapV2RouterABI = require("./abi/IUniswapV2Router02.json");

// Easily decode UniswapV2 Router data
abiDecoder.addABI(IUniswapV2RouterABI);

// Only does swapExactETHForTokens
// You'll need to extend it yourself :P
export const parseUniv2RouterTx = (txData) => {
  let data = null;
  try {
    data = abiDecoder.decodeMethod(txData);
  } catch (e) {
    return null;
  }

  if (data.name !== "swapExactETHForTokens") {
    return null;
  }

  const [amountOutMin, path, to, deadline] = data.params.map((x) => x.value);

  return {
    amountOutMin,
    path,
    to,
    deadline,
  };
};
