const fs = require('fs')
const stats = require("stats-lite") // TODO

const CONSENSUS = process.argv[2]
const [INPUT_RATE, DURATION_TIME, REPEAT, THREAD_NUM, TEST_TIME] = process.argv.slice(3, 8).map(it => parseInt(it))

const config = require('../configure.json')

for (let i = 1; i <= REPEAT; i++) {
  let latency = [], tps = []

  let post_process = require(`${config[CONSENSUS].path.post_process}/${THREAD_NUM}THREAD-${config.tendermint.urls.length}NODE/Rate${INPUT_RATE}-Sec${DURATION_TIME}-Test${TEST_TIME}.json`)
  //let post_process = require(`${config[CONSENSUS].path.post_process}/${THREAD_NUM}THREAD-${config.tendermint.urls.length}NODE/Rate${INPUT_RATE}-Sec${DURATION_TIME}-Test${i}.json`)
  let block = Object.keys(post_process).map(it => {
    return parseInt(it.split('_')[1])
  })
  block.sort(function(a, b) {
    return a - b;
  });

  // for test , not necessary
  if(block.length===1){
      let txs = post_process[`block_${block[0]}`].transactions
      let dtime = post_process[`block_${block[0]}`].timestamp - txs[0].split(',')[1]
  
      tps.push(1000 * (txs.length / (dtime)))
  
      for (let tx of txs) {
        let tx_timestamp = tx.split(',')[1]
  
        latency.push(post_process[`block_${block[0]}`].timestamp - tx_timestamp) // millisecond
      }
  
    console.log(`Testing${i} Rate${INPUT_RATE} DurationTime${DURATION_TIME}`)
    console.log(`Tps     , mean:${stats.mean(tps)}, var:${stats.variance(tps)}`)
    console.log(`Latency , mean:${stats.mean(latency)} ms, var:${stats.variance(latency)}\n`)
    return console.log("oneBlock")
  }
  // for test , not necessary

  for (let j = 1, k = block.length-1; j < k; j++) {  //block.length - 1 for normal situation , block.length for short duration time
    let txs = post_process[`block_${block[j]}`].transactions
    let dtime = post_process[`block_${block[j]}`].timestamp - post_process[`block_${block[j - 1]}`].timestamp

    tps.push(1000 * (txs.length / (dtime)))

    for (let tx of txs) {
      let tx_timestamp = tx.split(',')[1]

      latency.push(post_process[`block_${block[j]}`].timestamp - tx_timestamp) // millisecond
    }
  }

  console.log(`Testing${i} Rate${INPUT_RATE} DurationTime${DURATION_TIME}`)
  console.log(`Tps     , mean:${stats.mean(tps)}, var:${stats.variance(tps)}`)
  console.log(`Latency , mean:${stats.mean(latency)} ms, var:${stats.variance(latency)}\n`)
}
