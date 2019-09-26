const [INPUT_RATE, DURATION_TIME, REPEAT, SLEEP_TIME, SLICE, THREAD_NUM] = process.argv.slice(2, 8).map(it => parseInt(it))
const fs = require('fs')
const sendTx = require(`../lib/sdk.js`).sendTransaction
const getInfo = require(`../lib/sdk.js`).stellarInfo

const config = require('../../configure.json')

const app = {
  log: {},
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
  sent_txs: 0,
}

const privKey = Object.values(require(config.stellar.path.testAccount)).slice(SLICE,SLICE+app.max_txs_in_round)

const onePeriodTest = () => {
  let period = setInterval(() => {
    console.log( "sendtx" , app.sent_txs , Date.now())
    for (let i = 0; i < INPUT_RATE; i++) {
      sendTx(config.stellar.node_ip[i % 2], privKey[app.sent_txs++], config.stellar.destination.address[0])   // 2 is urls length, for testing
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
      console.log("clear")
      return clearInterval(round)
    }

    console.log(app.sent_txs, app.max_txs_in_round , Date.now()/1000 )
    onePeriodTest()

  }, (DURATION_TIME + SLEEP_TIME) * 1000)

}

// for test , not necessary
// async function forTest() {
//   let res = parseInt(JSON.parse(await getInfo()).result.sync_info.latest_block_height)
//   return new Promise((resolve , reject) => {
//     let interval = setInterval(async() => {
//       let res2 = parseInt(JSON.parse(await getInfo(config[CONSENSUS].urls[0])).result.sync_info.latest_block_height)
//       console.log(res,res2)
//       if(res+1==res2) {
//         clearInterval(interval)
//         resolve()
//       }
//     }, 500)
//   })
// }

;(async function () {
  //await forTest()
  onePeriodTest()
  oneRoundTest()
})()
// for test , not necessary



//oneRoundTest()
