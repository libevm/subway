const { ethers } = require("ethers");
const path = require('path')
const fs = require("fs");
const OUT_DIR = path.join(__dirname, "..", "out");

const bytecode = '0x' + fs.readFileSync(path.join(OUT_DIR, "sandwich.bytecode"), {
  encoding: "ascii",
});

// console.log(ethers.utils.defaultAbiCoder.encode(["bytes"], [bytecode]).replace('0x', ''));
process.stdout.write(ethers.utils.defaultAbiCoder.encode(["bytes"], [bytecode]))
