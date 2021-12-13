import { CONTRACTS, wssProvider, searcherWallet } from './src/constants.js'
import { logDebug, logInfo } from './src/logging.js'
import { parseUniv2RouterTx } from './src/parse.js'
import { match } from './src/utils.js'

const main = async () => {
  logInfo('============================================================================')
  logInfo('          _                       _         _   \r\n  ____  _| |____ __ ____ _ _  _  | |__  ___| |_ \r\n (_-< || | \'_ \\ V  V \/ _` | || | | \'_ \\\/ _ \\  _|\r\n \/__\/\\_,_|_.__\/\\_\/\\_\/\\__,_|\\_, | |_.__\/\\___\/\\__|\r\n | |__ _  _  | (_) |__  ___|__\/__ __            \r\n | \'_ \\ || | | | | \'_ \\\/ -_) V \/ \'  \\           \r\n |_.__\/\\_, | |_|_|_.__\/\\___|\\_\/|_|_|_|          \r\n       |__\/                                     \n')
  logInfo('github: https://github.com/libevm')
  logInfo('twitter: https://twitter.com/libevm')
  logInfo('============================================================================\n')
  logInfo(`Searcher Wallet: ${searcherWallet.address}`)
  logInfo(`Node URL: ${wssProvider.connection.url}\n`)
  logInfo('============================================================================\n')

  logInfo('Listening to mempool...\n')

  // Listen to the mempool on local node
  wssProvider.on("pending", async (txHash) => {
    // Bot not broken right
    logDebug(`txhash=${txHash} received`)

    // Get tx data
    const [tx, txRecp] = await Promise.all([
      wssProvider.getTransaction(txHash),
      wssProvider.getTransactionReceipt(txHash)
    ])

    // Make sure transaction isn't mined
    if (txRecp !== null) {
      return
    }

    // Sometimes tx is null for some reason
    if (tx === null) {
      return
    }

    // We're not a generalized version
    // So we're just gonna listen to specific addresses
    // and decode the data from there
    if (!match(tx.to, CONTRACTS.UNIV2_ROUTER)) {
      return
    }

    // Bot alert
    logInfo(`txhash=${txHash} univ2 router interaction found`)

    // Decode transaction data
    // i.e. is this swapExactETHForToken?
    const txDataDecoded = parseUniv2RouterTx(tx.data)
  })
}

main()