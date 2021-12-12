const { parseUnits } = require("@ethersproject/units");
const { getContractAddress } = require("@ethersproject/address");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const wethAbi = require("./abi/IWETH.json");

const OUT_DIR = path.join(__dirname, "..", "out");

const abi = fs.readFileSync(path.join(OUT_DIR, "sandwich.abi"), {
  encoding: "ascii",
});
const bytecode = fs.readFileSync(path.join(OUT_DIR, "sandwich.bytecode"), {
  encoding: "ascii",
});

const provider = new ethers.providers.JsonRpcProvider();

const main = async () => {
  const signer = await provider.getSigner(0);
  const signerAddress = await signer.getAddress();

  const weth = new ethers.Contract(wethAddress, wethAbi, signer);
  await weth.deposit({ value: parseUnits("1") }).then((x) => x.wait());

  const nonce = await provider.getTransactionCount(signerAddress);

  const contractAddress = getContractAddress({
    from: signerAddress,
    nonce,
  });

  const contractArgs = ethers.utils.defaultAbiCoder.encode(
    ["address"],
    [signerAddress]
  );
  const wethEncoded = ethers.utils.defaultAbiCoder
    .encode(["address"], [wethAddress])
    .replace("0x", "");
  const amountEncoded = ethers.utils.defaultAbiCoder
    .encode(["uint256"], [parseUnits("0.5")])
    .replace("0x", "");

  await signer
    .sendTransaction({
      data: "0x" + bytecode + contractArgs.replace("0x", ""),
      type: 0,
      gasLimit: 5000000,
      gasPrice: parseUnits("100", 9),
      nonce,
    })
    .then((x) => x.wait());

  await weth.transfer(contractAddress, parseUnits("1")).then((x) => x.wait());

  const tx2 = await signer.sendTransaction({
    to: contractAddress,
    data: "0x8980f11f" + wethEncoded + amountEncoded, // recoverERC20(address)
    gasLimit: 500000,
  });
  const tx2Recp = await tx2.wait();

  console.log("tx2Recp", tx2Recp.logs);

  // const code = await provider.getCode(contractAddress)

  // console.log('bytecode', bytecode)
  // console.log('data', data)
  // console.log('code', code)
};

main();
