const ethTx = require('ethereumjs-tx');
const fs = require('fs');

const PATH_CONFIGURE =  require('../configure.json')
const PATH_HOME = PATH_CONFIGURE.home_path
const PATH_PRIVKEY = `${PATH_HOME}/benchmark_v2/tendermint/data/testAccount-privKey`
const PATH_RAW_TX = `${PATH_HOME}/benchmark_v2/tendermint/res/RawTx`
const DES_ADDRESS = '0x6666666666666666666666666666666666666666'   //The address you want to send money

var ITER = parseInt( process.argv[2] ,10) ; // generate N numbers of txs


//  Get testing account private key
let priv_key = fs.readFileSync(PATH_PRIVKEY, 'utf-8').split('\n').slice(0, -1).map(raw => {
  return Buffer.from(raw.match(/(0x[a-f0-9]+)/g))
})

//  Generate Raw transactions
let raw_txs = []
while (ITER--) {
  let transaction = new ethTx({
    nonce: ITER,
    to: DES_ADDRESS,
    gasLimit: '0x30000',
    value: '0x01'
  })

  transaction.sign(priv_key[ITER % priv_key.length])

  raw_txs.push('0x' + transaction.serialize().toString('hex'))
}
console.log(raw_txs.length)

//  Output RawTx to [PATH_RAW_TX]
fs.writeFileSync(PATH_RAW_TX, raw_txs.join('\n'))
