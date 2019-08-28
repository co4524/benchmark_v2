const API = require('../lib/rpc.js')
const fs = require('fs')
const PATH_CONFIGURE =  require('../configure.json')
const PATH_HOME = PATH_CONFIGURE.home_path
const PATH_URL = PATH_HOME + '/benchmark_v2/tendermint/data/baseURL'
const PATH_RAW_TX = PATH_HOME + '/benchmark_v2/tendermint/res/RawTx'
const PATH_REQEST_TIME = PATH_HOME + '/benchmark_v2/tendermint/res/txRequestTime'

const INPUT_RATE = parseInt( process.argv[2] ,10) ;
const DURATION_TIME = parseInt( process.argv[3] ,10) ;
const REPEAT = parseInt( process.argv[4] ,10) ;
const SLEEP_TIME = parseInt( process.argv[5] ,10) ;

let base_url = fs.readFileSync(PATH_URL).toString().split("\n").slice(0, -1);
console.log(base_url)

const line_reader = new (require('line-by-line'))(PATH_RAW_TX)

const app = {
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round: INPUT_RATE * DURATION_TIME * REPEAT,
  sent_log: '',
  sent_tx: 0
}

if (fs.existsSync(PATH_REQEST_TIME))
  fs.unlinkSync(PATH_REQEST_TIME)

line_reader.pause()

line_reader.on('line', tx => {
  app.sent_log += `${tx}, ${Date.now()}\n`
  // API.sendTx(++app.sendTx % base_url.length, tx)

  if (0 === ++app.sent_tx % INPUT_RATE) {
    line_reader.pause()
  }

  if (0 === app.sent_tx % app.max_txs_in_period) {

    console.log('clear interval')

    console.log(app.sent_tx)

    clearInterval(app.send_txs_interval)

    fs.appendFileSync(PATH_REQEST_TIME, app.sent_log)

    line_reader.pause()
  }

  if (app.sent_tx === app.max_txs_in_round) {
    process.exit()
  }
})

const sendTxs = () => {
  app.sent_log = ''

  app.send_txs_interval = setInterval(() => {
    line_reader.resume()

    console.log('send txs')
  }, 1000)
}
sendTxs()

setInterval(sendTxs, (DURATION_TIME + SLEEP_TIME) * 1000)


// var line = 0
// var raw_txs = []
// var timer = 0
// var repeat_time = 0
// var send_time = []

line_reader.on('error', err => { throw(err) })

// line_reader.on('line', it => {
//     raw_txs.push(it)
//     line++
//
//     if (line%INPUT_RATE==0) {    // Read [$INPUT_RATE] lines of files , stop reading for 1 sec
//         line_reader.pause()
//         console.log(`time : ${timer} , send ${INPUT_RATE} transactions `);
//         raw_txs.map((raw,index) => {
//             send_time[line-INPUT_RATE+index] = Date.now()   // let every transaction has it's own request_time
//             API.sendTx( base_url[index%base_url.length] , raw );   //  send transactions to each node (RR)
//         })
//         setTimeout(() => {
//             line_reader.resume()
//             raw_txs.length=0  //reset array
//             timer++
//         }, 1000)
//     }
//
//     if (timer==DURATION_TIME) {  // if timer = duration_time ,stop reading for [$SLEEP_TIME] ms
//         repeat_time++
//         console.log(`Repeat ${repeat_time} time , sleep ${SLEEP_TIME} ms`)
//         line_reader.pause()
//         setTimeout(() => {
//             timer = 0  // reset timer
//             line_reader.resume()
//         }, SLEEP_TIME)
//     }
//
//     if (repeat_time==REPEAT) {
//         console.log(`Reading finished`)
//         fs.writeFileSync(PATH_REQEST_TIME, send_time.join('\n'))
//         line_reader.pause()
//     }
// })

