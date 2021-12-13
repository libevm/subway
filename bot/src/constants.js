// Globals

import { ethers } from 'ethers'
import dotenv from 'dotenv'
dotenv.config()

import { logError } from './logging.js'

let hasEnv = true

const ENV_VARS = [
  'RPC_URL', 'RPC_URL_WSS', 'PRIVATE_KEY', 'FLASHBOTS_AUTH_KEY'
]

for (let i = 0; i < ENV_VARS.length; i++) {
  if (!process.env[ENV_VARS[i]]) {
    logError(`Missing env var ${ENV_VARS[i]}`)
    hasEnv = false
  }
}

if (!hasEnv) {
  process.exit(1)
}

// Contracts
export const CONTRACTS = {
  'UNIV2_ROUTER': '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
}

// Providers
export const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
export const wssProvider = new ethers.providers.WebSocketProvider(process.env.RPC_URL_WSS)

// Used to send transactions, needs ether
export const searcherWallet = new ethers.Wallet(process.env.PRIVATE_KEY, wssProvider)

// Used to sign flashbots headers doesn't need any ether
export const authKeyWallet = new ethers.Wallet(process.env.PRIVATE_KEY, wssProvider)
