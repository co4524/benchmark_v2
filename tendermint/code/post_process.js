const fs = require('fs')
const getTransactionReceipt = require(`../lib/rpc.js`).getTransactionReceipt

const config = require('../../configure.json')
const [INPUT_RATE, DURATION_TIME, REPEAT] = process.argv.slice(2, 5).map(it => parseInt(it))

const block_commit_time = fs.readFileSync(config.tendermint.path.block_commit_time, 'utf-8').split('\n').slice(0, -1)  // 28,50,1568105264997 => block_number,transaction_number,block_commit_time
const transaction_log = require(config.tendermint.path.transaction_log)
const txs = Object.keys(require(config.tendermint.path.raw_tx_hash))

const app = {
  block_info: {},
  repeat_count: 0,
  txs_in_one_period: INPUT_RATE * DURATION_TIME
}

for (let block of block_commit_time) {
  let [height, num_txs, timestamp] = it.split(',')

  app.block_info[`block_${height}`] = {
    num_txs: num_txs,
    timestamp: parseInt(timestamp),
    transactions: []
  }
}

;(async function () {

  while (app.repeat_count < REPEAT) {
    let rlt = {}

    for (let i = app.txs_in_one_period * app.repeat_count; i < app.txs_in_one_period * (app.repeat_count + 1); i++) {
      let tx_block_height = JSON.parse(await getTransactionReceipt(config.tendermint.urls[0], txs[i])).result.height

      if (undefined === rlt[`block_${tx_block_height}`]) {
        rlt[`block_${tx_block_height}`] = JSON.parse(JSON.stringify(app.block_info[`block_${tx_block_height}`]))
      }

      rlt[`block_${tx_block_height}`].transactions.push(`${txs[i]},${transaction_log[txs[i]]}`)
    }

    fs.writeFileSync(`${config.tendermint.path.post_process}/Rate${INPUT_RATE}-Sec${DURATION_TIME}-Test${++app.repeat_count}.json`, JSON.stringify(rlt, null, 2))
  }

})()
