const yulp = require('yulp')
const solc = require('solc')
const fs = require('fs')
const path = require('path')

const CONTRACTS_DIR = path.join(__dirname, '..', 'src')
const OUT_DIR = path.join(__dirname, '..', 'out')

const sourceCode = fs.readFileSync(path.join(CONTRACTS_DIR, 'Sandwich.yulp'), { encoding: 'ascii' })
const source = yulp.compile(sourceCode)

const output = JSON.parse(solc.compile(JSON.stringify({
    "language": "Yul",
    "sources": { "Sandwich.yul": { "content": yulp.print(source.results) } },
    "settings": {
        "outputSelection": { "*": { "*": ["*"], "": ["*"] } },
        "optimizer": {
            "enabled": true,
            "runs": 0,
            "details": {
                "yul": true
            }
        }
    }
})))

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR)
}

const abi = source.signatures.map(v => v.abi.slice(4, -1)).concat(source.topics.map(v => v.abi.slice(6, -1)))
const bytecode = output.contracts["Sandwich.yul"]["Sandwich"]["evm"]["bytecode"]["object"]

fs.writeFileSync(path.join(OUT_DIR, 'sandwich.out.json'), JSON.stringify(output))
fs.writeFileSync(path.join(OUT_DIR, 'sandwich.abi'), JSON.stringify(abi))
fs.writeFileSync(path.join(OUT_DIR, 'sandwich.bytecode'), bytecode)

console.log(bytecode)