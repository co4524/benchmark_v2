const API = require('../lib/rpc.js')
const fs = require('fs')
const PATH_CONFIGURE =  require('../configure.json')
const PATH_HOME = PATH_CONFIGURE.home_path
const URL = require("../data/baseURL.json")
const PATH_RAW_TX = PATH_HOME + '/benchmark_v2/tendermint/res/RawTx'
const PATH_REQEST_TIME = PATH_HOME + '/benchmark_v2/tendermint/res/txRequestTime'
const line_reader = new (require('line-by-line'))(PATH_RAW_TX)

const INPUT_RATE = parseInt( process.argv[2] ,10)
const DURATION_TIME = parseInt( process.argv[3] ,10)
const REPEAT = parseInt( process.argv[4] ,10)
const SLEEP_TIME = parseInt( process.argv[5] ,10)

const app = {
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round: INPUT_RATE * DURATION_TIME * REPEAT,
  sent_log: '',
  sent_tx: 0
}
console.log(app)

// reset txrequest_time file
if (fs.existsSync(PATH_REQEST_TIME))
  fs.unlinkSync(PATH_REQEST_TIME)

line_reader.on('error', err => { throw(err) })

line_reader.pause()
line_reader.on('line', tx => {
  app.sent_log += `${tx}, ${Date.now()}\n`
  API.sendTx(URL[++app.sent_tx % URL.length], tx)

  if (0 === app.sent_tx % INPUT_RATE) {
    line_reader.pause()
  }
})

const sendTxs = () => {
  if (app.sent_tx === app.max_txs_in_round) {
    return process.exit()
  }

  app.sent_log = ''
  app.reset_interval = false

  app.send_txs_interval = setInterval(() => {
    console.log(app.sent_tx)

    if (app.reset_interval && 0 === app.sent_tx % app.max_txs_in_period) {

      clearInterval(app.send_txs_interval)

      console.log(`clearInterval\nTrasaction Number ${app.sent_tx}`)

      fs.appendFileSync(PATH_REQEST_TIME, app.sent_log)
    }

    else {
      console.log(`send ${INPUT_RATE} txs`)

      app.reset_interval = true

      line_reader.resume()
    }
  }, 1000)
}

sendTxs()

setInterval(sendTxs, (DURATION_TIME + SLEEP_TIME) * 1000)
