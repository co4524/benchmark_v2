const fs = require('fs')
const stats = require("stats-lite") 
const config = require('../configure.json')
const [input_path, output_path, model, input_rate, node_num] = process.argv.slice(2,7)
const REPEAT = 1


for (let i = 1; i <= REPEAT; i++) {
  let latency = [], tps = []

  let post_process = require(input_path)
  let block = Object.keys(post_process).map(it => {
    return parseInt(it.split('_')[1])
  })
  block.sort(function(a, b) {
    return a - b;
  });
  
  // raft_tps
  let txs_count = 0
  let start_time=[]
  let end_time=[]
  for (let i = 0; i < block.length-1; i++){
    txs_count += post_process[`block_${block[i]}`].transactions.length
  }

  for (let i = 0; i < parseInt(node_num, 10) ; i++){
    let time = post_process[`block_${block[0]}`].timestamp[i]
    start_time.push(time[`node${i}`])
  }

  for (let i = 0; i < parseInt(node_num, 10) ; i++){
    let time = post_process[`block_${block[block.length-1]}`].timestamp[i]
    end_time.push(time[`node${i}`])
  }
  tps.push(txs_count*1000/(stats.median(end_time)-stats.median(start_time)))

  for (let j = 1, k = block.length-1; j < k; j++) {  //block.length - 1 for normal situation , block.length for short duration time
    let txs = post_process[`block_${block[j]}`].transactions
    let arr =[]
    for(let l = 0 ; l < parseInt(node_num, 10) ; l ++){
      let time = post_process[`block_${block[j]}`].timestamp[l]
      arr.push(time[`node${l}`])
    }
    for (let tx of txs) {
      let tx_timestamp = tx.split(',')[1]/1000000
      let time_med = stats.median(arr)
      latency.push(time_med - tx_timestamp) // millisecond
    }
  }

  let log = `${model}\nTxRate,${input_rate}\nTPS,${stats.mean(tps)}\nLatency,${stats.mean(latency)}\nTPS_var,${stats.variance(tps)}\nLatency_var,${stats.variance(latency)}\n`
  console.log(log)
  if(parseInt(input_rate, 10)===config.setting.transaction_rate[0]){
    fs.existsSync(output_path) && fs.unlinkSync(output_path)
    fs.writeFileSync(output_path,log)
  }
  else{
    let log2 = `${model}\n`
    let arr = fs.readFileSync(output_path,"utf-8").split('\n').slice(0,-1)
    let arr2 = log.split('\n').slice(0,-1)
    for(let i = 1 ; i < arr.length ; i++){
      log2+=`${arr[i]},${arr2[i].split(',')[1]}\n`
    }
    fs.writeFileSync(output_path,log2)
  }
}
