const fs = require('fs')
var stats = require("stats-lite")
const config =  require('../configure.json')

const block_commit_time = fs.readFileSync(config[process.argv[2]].path.block_commit_time, 'utf-8').split('\n')
const block_tx_num = fs.readFileSync(config[process.argv[2]].path.block_tx_num, 'utf-8').split('\n')
const tx_request_time = fs.readFileSync(config[process.argv[2]].path.preprocess_tx_request_time, 'utf-8').split('\n')

const INPUT_RATE = parseInt( process.argv[3] ,10)
const DURATION_TIME = parseInt( process.argv[4] ,10)
const REPEAT = parseInt( process.argv[5] ,10)

const app = {
    max_txs_in_period: INPUT_RATE * DURATION_TIME,
    max_txs_in_round: INPUT_RATE * DURATION_TIME * REPEAT
  }

let index = 0
let one_period_block_num = []
let one_period_block_commit_time = []
let tps = []
let latency = []
let testing_time = 0
let start_index = 0

for (let i = 0 ; i < block_tx_num.length ; i++ ){
  index += parseInt(block_tx_num[i] ,10)
  one_period_block_num.push(parseInt(block_tx_num[i],10))
  one_period_block_commit_time.push(parseInt(block_commit_time[i],10))
  if(index == app.max_txs_in_period){
    start_index = app.max_txs_in_period*testing_time + one_period_block_num[0]
    for (let j = 1 ; j < one_period_block_num.length-1 ; j++ ){
      tps.push(parseFloat(one_period_block_num[j])/(parseFloat(one_period_block_commit_time[j+1])-parseFloat(one_period_block_commit_time[j]))*1000 )
      for (let k = 0 ; k < one_period_block_num[j] ; k++){
        latency.push( (parseFloat(one_period_block_commit_time[j]) - parseFloat(tx_request_time[start_index++]))/1000 )
      }
    }
    console.log(`${testing_time} Round Testing`)
    console.log(one_period_block_num)
    console.log("TPS mean: %s", stats.mean(tps) , " variance:", stats.variance(tps))
    console.log("Latency mean: %s", stats.mean(latency) , " variance:", stats.variance(latency))
    index = 0
    testing_time ++
    latency = []
    tps = []
    one_period_block_num = []
    one_period_block_commit_time = []
  }
}