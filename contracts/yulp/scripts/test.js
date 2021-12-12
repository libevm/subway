const { parseUnits } = require('@ethersproject/units')
const { getContractAddress } = require('@ethersproject/address')
const { ethers } = require('ethers')
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname, '..', 'out')

const abi = fs.readFileSync(path.join(OUT_DIR, 'sandwich.abi'), { encoding: 'ascii' })
const bytecode = fs.readFileSync(path.join(OUT_DIR, 'sandwich.bytecode'), { encoding: 'ascii' })

const provider = new ethers.providers.JsonRpcProvider()

const main = async () => {
  const signer = await provider.getSigner(0)
  const signerAddress = await signer.getAddress()
  const nonce = await provider.getTransactionCount(signerAddress)

  const contractAddress = getContractAddress({
    from: signerAddress,
    nonce
  })

  const contractArgs = ethers.utils.defaultAbiCoder.encode(['address'], [signerAddress])
  const zeros = '0000000000000000000000000000000000000000000000000000000000000000'
  const tx = await signer.sendTransaction({
    data: '0x' + bytecode + contractArgs.replace('0x', ''),
    type: 0,
    gasLimit: 5000000,
    gasPrice: parseUnits('100', 9),
    nonce
  })
  await tx.wait()

  const data = await signer.call({
    to: contractAddress,
    data: '0x8980f11f' + contractArgs.replace('0x', '') + zeros // recoverERC20(address)
  })

  const code = await provider.getCode(contractAddress)

  console.log('bytecode', bytecode)
  console.log('data', data)
  console.log('code', code)
}

main()