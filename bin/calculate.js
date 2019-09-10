const fs = require('fs')
var stats = require("stats-lite")
const CONSENSUS = process.argv[2]
const [INPUT_RATE, DURATION_TIME, REPEAT] = process.argv.slice(3, 6).map(it => parseInt(it))
const config =  require('../configure.json')

const app = {
    latency : [],
    tps : []
}

for(let i = 1 ; i < REPEAT+1 ; i ++){

  let post_process =  require(`${config[CONSENSUS].path.post_process}/Rate${INPUT_RATE}-Sec${DURATION_TIME}-Test${REPEAT}.json`)
  let block = Object.keys(post_process)

  for (let j = 1 ; j <　block.length-1 ; j ++){   // remove first & last block
    let hash = Object.keys(post_process[block[j]].transactions)
    app.tps.push( (hash.length/(parseFloat(post_process[block[j+1]].timeStamp)-parseFloat(post_process[block[j]].timeStamp)))*1000 )
    for (let k = 0 ; k < hash.length ; k ++){
      let txs_request = parseFloat(post_process[block[j]].transactions[k].split(',')[1])
      app.latency.push( (parseFloat(post_process[block[j]].timeStamp)-txs_request)/1000 )
    }
  }

  console.log(`Testing${i} Rate${INPUT_RATE} DurationTime${DURATION_TIME}`)
  console.log(`Tps     , mean:${stats.mean(app.tps)}, var:${stats.variance(app.tps)}`)
  console.log(`Latency , mean:${stats.mean(app.latency)}, var:${stats.variance(app.latency)}\n`)
  app.latency = []
  app.tps = []
}







// let index = 0
// let one_period_block_num = []
// let one_period_block_commit_time = []
// let tps = []
// let latency = []
// let testing_time = 0
// let start_index = 0

// for (let i = 0 ; i < block_tx_num.length ; i++ ){
//   index += parseInt(block_tx_num[i] ,10)
//   one_period_block_num.push(parseInt(block_tx_num[i],10))
//   one_period_block_commit_time.push(parseInt(block_commit_time[i],10))
//   if(index == app.max_txs_in_period){
//     start_index = app.max_txs_in_period*testing_time + one_period_block_num[0]
//     for (let j = 1 ; j < one_period_block_num.length-1 ; j++ ){
//       tps.push(parseFloat(one_period_block_num[j])/(parseFloat(one_period_block_commit_time[j+1])-parseFloat(one_period_block_commit_time[j]))*1000 )
//       for (let k = 0 ; k < one_period_block_num[j] ; k++){
//         latency.push( (parseFloat(one_period_block_commit_time[j]) - parseFloat(tx_request_time[start_index++]))/1000 )
//       }
//     }
//     console.log(`${testing_time} Round Testing`)
//     console.log(one_period_block_num)
//     console.log("TPS mean: %s", stats.mean(tps) , " variance:", stats.variance(tps))
//     console.log("Latency mean: %s", stats.mean(latency) , " variance:", stats.variance(latency))
//     index = 0
//     testing_time ++
//     latency = []
//     tps = []
//     one_period_block_num = []
//     one_period_block_commit_time = []
//   }
// }