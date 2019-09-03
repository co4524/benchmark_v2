const sendTx = require('../lib/rpc.js').sendTx
const ethTx = require('ethereumjs-tx')
const fs = require('fs')

const config = require('../../configure.json')
const DES_ADDRESS = '0x6666666666666666666666666666666666666666' // The address you want to send money

// const URL = require("../data/baseURL.json")
// const PATH_CONFIGURE =  require('../configure.json')
// const PATH_HOME = PATH_CONFIGURE.home_path
// const PATH_PRIVKEY = `${PATH_HOME}/benchmark_v2/tendermint/data/testAccount-privKey`
// const PATH_RAW_TX = `${PATH_HOME}/benchmark_v2/tendermint/res/RawTx`
// const PATH_HASH_TX = `${PATH_HOME}/benchmark_v2/tendermint/res/HashTx`

const size = {
  batch: 10000,
  raw_txs: 1000000
}

// reset output data

fs.existsSync(config.tendermint.path.raw_tx) && fs.unlinkSync(config.tendermint.path.raw_tx)
fs.existsSync(config.tendermint.path.raw_tx_hash) && fs.unlinkSync(config.tendermint.path.raw_tx_hash)

// private keys

const priv_key = fs.readFileSync(config.tendermint.path.private_key, 'utf-8').split('\n').slice(0, -1).map(raw => {
  return Buffer.from(raw.match(/(0x[a-f0-9]+)/g))
})

;(async function () {

  let raw_txs = [], raw_tx_hashes = {}

  // generate transactions

  while (size.raw_txs--) {
    let transaction = new ethTx({
      nonce: size.raw_txs,
      to: DES_ADDRESS,
      gasLimit: '0x30000',
      value: '0x01'
    })

    // sign transactions

    transaction.sign(priv_key[size.raw_txs % priv_key.length])
    raw_txs.push('0x' + transaction.serialize().toString('hex'))

    // get transaction hash and output

    if (raw_txs.length === size.batch) {
      console.log(`Generate ${size.batch} transations & hash , Remaining amount : ${size.raw_txs}`)

      let receipts = await Promise.all(raw_txs.map((raw_tx, i) => sendTx(config.tendermint.urls[i % config.tendermint.urls.length], raw_tx)))

      for (let i in raw_txs) {
        raw_tx_hashes[raw_txs[i]] = JSON.parse(receipts).result.hash
      }

      fs.appendFileSync(config.tendermint.path.raw_tx, `${raw_txs.join('\n')}\n`)

      raw_txs = []
    }
  }

  fs.writeFileSync(config.tendermint.path.raw_tx_hash, JSON.stringify(raw_tx_hashes))

})()
