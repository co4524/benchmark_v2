const CONSENSUS = process.argv[2]
const [INPUT_RATE, DURATION_TIME, REPEAT, SLEEP_TIME, SLICE] = process.argv.slice(3, 8).map(it => parseInt(it))
const fs = require('fs')
const sendTx = require(`../${CONSENSUS}/lib/rpc.js`).sendTx

const config = require('../configure.json')
const raw_tx_hash = require(config[CONSENSUS].path.raw_tx_hash)
const txs = Object.keys(raw_tx_hash).slice(SLICE) // SLICE for testing

const app = {
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
  sent_txs: 0,
  log: ''
}

const onePeriodTest = () => {
  let period = setInterval(() => {
    console.log( "sendtx" , app.sent_txs ) 
    for (let i = 0; i < INPUT_RATE; i++) {
      sendTx(config[CONSENSUS].urls[i % config[CONSENSUS].urls.length], txs[app.sent_txs++]).then((it) => app.log+= `${JSON.parse(it).result.hash},${JSON.parse(it).result.time}\n`)
    }

    if (0 === app.sent_txs % app.max_txs_in_period) {
      console.log( "sendtx" , app.sent_txs ) 
      clearInterval(period)
    }
  }, 1000)
}

let round = setInterval(() => {
  if (app.sent_txs === app.max_txs_in_round) {
    fs.writeFileSync(config.tendermint.path.transaction_log, app.log)
    return clearInterval(round)
  }
  console.log(app.sent_txs, app.max_txs_in_round)
  onePeriodTest()

}, (DURATION_TIME + SLEEP_TIME) * 1000)
