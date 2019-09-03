const ethTx = require('ethereumjs-tx');
const fs = require('fs');
const API = require('../lib/rpc.js')
const URL = require("../data/baseURL.json")
const PATH_CONFIGURE =  require('../configure.json')
const PATH_HOME = PATH_CONFIGURE.home_path
const PATH_PRIVKEY = `${PATH_HOME}/benchmark_v2/tendermint/data/testAccount-privKey`
const PATH_RAW_TX = `${PATH_HOME}/benchmark_v2/tendermint/res/RawTx`
const PATH_HASH_TX = `${PATH_HOME}/benchmark_v2/tendermint/res/HashTx`
const DES_ADDRESS = '0x6666666666666666666666666666666666666666'   //The address you want to send money

const app = {
    raw_tx_size : 1000000 ,
    batch_size : 10000 
}

async function generateRawTxAndHash(){

  let raw_txs = []
  let hash_list = []

  while (app.raw_tx_size--) {   // generate ${raw_tx_size} transactions

    let transaction = new ethTx({
      nonce: app.raw_tx_size,
      to: DES_ADDRESS,
      gasLimit: '0x30000',
      value: '0x01'
    })

    // sign transaction & push it in array
    transaction.sign(priv_key[app.raw_tx_size % priv_key.length])
    raw_txs.push('0x' + transaction.serialize().toString('hex'))

    if(raw_txs.length==app.batch_size){     // generate ${batch_size} raw_transactions & transaction hash
      console.log(`Generate ${app.batch_size} transations & hash , Remaining amount : ${app.raw_tx_size}`)
      for (let i = 0 ; i < app.batch_size ; i ++){
        hash_list[i] = API.sendTx(URL[i%URL.length], raw_txs[i])
      }

      Promise.all(hash_list)
      for(let i=0 ; i < hash_list.length ; i++){
          hash_list[i] = JSON.parse(await hash_list[i]).result.hash
      }

      fs.appendFileSync(PATH_RAW_TX, raw_txs.join('\n'))
      fs.appendFileSync(PATH_RAW_TX, "\n")
      fs.appendFileSync(PATH_HASH_TX, hash_list.join('\n'))
      fs.appendFileSync(PATH_HASH_TX, "\n")
      raw_txs = []
      hash_list = []
    }

  }

}

// reset data
if (fs.existsSync(PATH_RAW_TX))
  fs.unlinkSync(PATH_RAW_TX)

// reset data
if (fs.existsSync(PATH_HASH_TX))
  fs.unlinkSync(PATH_HASH_TX)

//  Get testing account private key
var priv_key = fs.readFileSync(PATH_PRIVKEY, 'utf-8').split('\n').slice(0, -1).map(raw => {
  return Buffer.from(raw.match(/(0x[a-f0-9]+)/g))
})

// generate raw_txs & hash batch by batch
generateRawTxAndHash()