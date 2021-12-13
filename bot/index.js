import { ethers } from "ethers";
import { CONTRACTS, wssProvider, searcherWallet } from "./src/constants.js";
import { logDebug, logFatal, logInfo, logTrace } from "./src/logging.js";
import { calcSandwichOptimalIn, calcSandwichState } from "./src/numeric.js";
import { parseUniv2RouterTx } from "./src/parse.js";
import {
  getUniv2ExactWethTokenMinRecv,
  getUniv2PairAddress,
  getUniv2Reserve,
} from "./src/univ2.js";
import { match, stringifyBN } from "./src/utils.js";

const sandwichUniswapV2RouterTx = async (txHash) => {
  const strLogPrefix = `txhash=${txHash}`;

  // Bot not broken right
  logTrace(strLogPrefix, "received");

  // Get tx data
  const [tx, txRecp] = await Promise.all([
    wssProvider.getTransaction(txHash),
    wssProvider.getTransactionReceipt(txHash),
  ]);

  // Make sure transaction hasn't been mined
  if (txRecp !== null) {
    return;
  }

  // Sometimes tx is null for some reason
  if (tx === null) {
    return;
  }

  // We're not a generalized version
  // So we're just gonna listen to specific addresses
  // and decode the data from there
  if (!match(tx.to, CONTRACTS.UNIV2_ROUTER)) {
    return;
  }

  // Decode transaction data
  // i.e. is this swapExactETHForToken?
  // You'll have to decode all the other possibilities :P
  const routerDataDecoded = parseUniv2RouterTx(tx.data);

  // Basically means its not swapExactETHForToken and you need to add
  // other possibilities
  if (routerDataDecoded === null) {
    return;
  }

  const { path, amountOutMin, deadline } = routerDataDecoded;

  // If tx deadline has passed, just ignore it
  // As we cannot sandwich it
  if (deadline > new Date().getTime() / 1000) {
    // return;
  }

  // Get the min recv for token directly after WETH
  const userMinRecv = await getUniv2ExactWethTokenMinRecv(amountOutMin, path);
  const userAmountIn = tx.value; // User is sending exact ETH (not WETH)

  logTrace(
    strLogPrefix,
    "potentially sandwichable swapExactETHForTokens tx found",
    JSON.stringify(
      stringifyBN({
        userAmountIn,
        userMinRecv,
        path,
      })
    )
  );

  // Note: Since this is swapExactETHForTokens, the path will always be like so
  // Get the optimal in amount
  const [weth, token] = path;
  const pairToSandwich = getUniv2PairAddress(weth, token);
  const [reserveWeth, reserveToken] = await getUniv2Reserve(
    pairToSandwich,
    weth,
    token
  );
  const optimalWethIn = calcSandwichOptimalIn(
    userAmountIn,
    userMinRecv,
    reserveWeth,
    reserveToken
  );

  // Lmeow, nothing to sandwich!
  if (optimalWethIn.lte(ethers.constants.Zero)) {
    return;
  }

  const sandwichStates = calcSandwichState(
    optimalWethIn,
    userAmountIn,
    userMinRecv,
    reserveWeth,
    reserveToken
  );

  // Sanity check failed
  if (sandwichStates === null) {
    logDebug(
      strLogPrefix,
      "sandwich sanity check failed",
      JSON.stringify(
        stringifyBN({
          optimalWethIn,
          reserveToken,
          reserveWeth,
          userAmountIn,
          userMinRecv,
        })
      )
    );
  }

  logInfo(
    strLogPrefix,
    "sandwichable target found",
    JSON.stringify(sandwichStates)
  );
};

const main = async () => {
  logInfo(
    "============================================================================"
  );
  logInfo(
    "          _                       _         _   \r\n  ____  _| |____ __ ____ _ _  _  | |__  ___| |_ \r\n (_-< || | '_ \\ V  V / _` | || | | '_ \\/ _ \\  _|\r\n /__/\\_,_|_.__/\\_/\\_/\\__,_|\\_, | |_.__/\\___/\\__|\r\n | |__ _  _  | (_) |__  ___|__/__ __            \r\n | '_ \\ || | | | | '_ \\/ -_) V / '  \\           \r\n |_.__/\\_, | |_|_|_.__/\\___|\\_/|_|_|_|          \r\n       |__/                                     \n"
  );
  logInfo("github: https://github.com/libevm");
  logInfo("twitter: https://twitter.com/libevm");
  logInfo(
    "============================================================================\n"
  );
  logInfo(`Searcher Wallet: ${searcherWallet.address}`);
  logInfo(`Node URL: ${wssProvider.connection.url}\n`);
  logInfo(
    "============================================================================\n"
  );

  // Add timestamp to all subsequent console.logs
  // One little two little three little dependency injections....
  const origLog = console.log;
  console.log = function (obj, ...placeholders) {
    if (typeof obj === "string")
      placeholders.unshift("[" + new Date().toISOString() + "] " + obj);
    else {
      // This handles console.log( object )
      placeholders.unshift(obj);
      placeholders.unshift("[" + new Date().toISOString() + "] %j");
    }

    origLog.apply(this, placeholders);
  };

  logInfo("Listening to mempool...\n");

  // Listen to the mempool on local node
  wssProvider.on("pending", (txHash) =>
    sandwichUniswapV2RouterTx(txHash).catch((e) => {
      logFatal(`txhash=${txHash} error ${e.toString()}`);
    })
  );
};

main();
