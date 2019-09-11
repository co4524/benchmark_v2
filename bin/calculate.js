const fs = require('fs')
const stats = require("stats-lite") // TODO

const CONSENSUS = process.argv[2]
const [INPUT_RATE, DURATION_TIME, REPEAT] = process.argv.slice(3, 6).map(it => parseInt(it))

const config = require('../configure.json')

for (let i = 1; i <= REPEAT; i++) {
  let latency = [], tps = []

  let post_process = require(`${config[CONSENSUS].path.post_process}/Rate${INPUT_RATE}-Sec${DURATION_TIME}-Test${i}.json`)
  let block = Object.keys(post_process).sort() // TODO

  for (let j = 1, k = block.length - 1; j < k; j++) {
    let txs = post_process[block[j]].transactions
    let dtime = post_process[block[j]].timestamp - post_process[block[j - 1]].timestamp

    tps.push(1000 * (txs.length / (dtime)))

    for (let tx of txs) {
      let [hash, tx_timestamp] = tx.split(',')

      latency.push(post_process[block[j]].timestamp - tx_timestamp) // millisecond
    }
  }

  console.log(`Testing${i} Rate${INPUT_RATE} DurationTime${DURATION_TIME}`)
  console.log(`Tps     , mean:${stats.mean(tps)}, var:${stats.variance(tps)}`)
  console.log(`Latency , mean:${stats.mean(latency)}, var:${stats.variance(latency)}\n`)
}
