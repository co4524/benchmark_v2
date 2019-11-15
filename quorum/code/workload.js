const CONSENSUS = "quorum"
const [INPUT_RATE, DURATION_TIME, REPEAT, SLEEP_TIME, SLICE] = process.argv.slice(2, 8).map(it => parseInt(it))
const Web3 = require('web3')
const config = require('../../configure.json')
const web3 = []
config.quorum.nodeIp.map((it, index) => {
    web3[index] = new Web3(new Web3.providers.WebsocketProvider(`ws://${it}:22000`))
})
const sendTx = require(`../lib/api.js`).sendTx

const txs = Object.keys(require(config[CONSENSUS].path.raw_transaction)).slice(SLICE) // SLICE for thread
console.log("read done")
const app = {
  log: {},
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
  sent_txs: 0,
}

const onePeriodTest = () => {
  let period = setInterval(() => {
    console.log( "sendtx" , app.sent_txs , Date.now())
    for (let i = 0; i < INPUT_RATE; i++) {
      sendTx(web3[i % config[CONSENSUS].urls.length], txs[app.sent_txs++])
    }

    if (0 === app.sent_txs % app.max_txs_in_period) {
      console.log( "sendtx" , app.sent_txs )
      clearInterval(period)
    }
  }, 1000)
}

function oneRoundTest(){

  let round = setInterval(() => {

    if (app.sent_txs === app.max_txs_in_round) {
      for (let i = 0; i < config.setting.node_num; i++) {
        web3[i].currentProvider.connection.close()
      }
      console.log("close web socket")
      return clearInterval(round)
    }
    onePeriodTest()

  }, (DURATION_TIME + SLEEP_TIME) * 1000)

}

;(async function () {
  onePeriodTest()
  oneRoundTest()
})()
