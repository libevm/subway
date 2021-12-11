const yulp = require('yulp')
const solc = require('solc')
const fs = require('fs')

const sourceCode = fs.readFileSync('./src/Sandwich.yulp', { encoding: 'ascii' })
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

if (!fs.existsSync('./out')) {
    fs.mkdirSync('./out')
}

fs.writeFileSync('./out/yulp.out.json', JSON.stringify(output))