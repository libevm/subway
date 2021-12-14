// Globals
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import dotenv from "dotenv";
dotenv.config();

import { ethers } from "ethers";
import { logError } from "./logging.js";

const IUniswapV2PairAbi = require("./abi/IUniswapV2Pair.json");

let hasEnv = true;

const ENV_VARS = [
  "RPC_URL",
  "RPC_URL_WSS",
  "PRIVATE_KEY",
  "FLASHBOTS_AUTH_KEY",
  "SANDWICH_CONTRACT",
];

for (let i = 0; i < ENV_VARS.length; i++) {
  if (!process.env[ENV_VARS[i]]) {
    logError(`Missing env var ${ENV_VARS[i]}`);
    hasEnv = false;
  }
}

if (!hasEnv) {
  process.exit(1);
}

// Contracts
export const CONTRACTS = {
  UNIV2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",

  // Sandwich contract
  SANDWICH: process.env.SANDWICH_CONTRACT,
};

// Helpful tokens for testing
export const TOKENS = {
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
};

// Providers
export const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL
);
export const wssProvider = new ethers.providers.WebSocketProvider(
  process.env.RPC_URL_WSS
);

// Used to send transactions, needs ether
export const searcherWallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  wssProvider
);

// Used to sign flashbots headers doesn't need any ether
export const authKeyWallet = new ethers.Wallet(
  process.env.PRIVATE_KEY,
  wssProvider
);

// Common contracts
export const uniswapV2Pair = new ethers.Contract(
  ethers.constants.AddressZero,
  IUniswapV2PairAbi,
  searcherWallet
);
