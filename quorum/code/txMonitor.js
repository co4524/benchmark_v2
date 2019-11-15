const [INPUT_RATE, DURATION_TIME, REPEAT] = process.argv.slice(2, 7).map(it => parseInt(it))
const Web3 = require('web3')
const fs = require('fs')
const api = require(`../lib/api.js`)
const config = require('../../configure.json')
const web3 = []
config.quorum.nodeIp.map((it, index) => {
    web3[index] = new Web3(new Web3.providers.WebsocketProvider(`ws://${it}:22000`))
})
const testing_time = 1

const app = {
    log: {},
    node_num: config.quorum.nodeIp.length,
    report: {},
    max_txs_in_period: INPUT_RATE * DURATION_TIME,
    max_txs_in_round:  INPUT_RATE * DURATION_TIME * REPEAT,
    start_block_num: 0,
    end_block_num: 0,
}

;(async function monitor() {
    let first_block = true
    let interval_time = 1000
    let start_balance = parseInt(await api.getBalance(web3[0], config.setting.des_address), 10)
    let interval = setInterval(async() => {
        let current_block_height = await api.getCurrentBlock(web3[0])
        let block_transactions = parseInt((await api.getBlock(web3[0], current_block_height)).transactions.length, 10)
        let expect_balance = parseInt(await api.getBalance(web3[0], config.setting.des_address), 10)
        console.log(current_block_height,block_transactions,expect_balance,start_balance+app.max_txs_in_round)
        if(block_transactions!=0){
            if(first_block){
                app.start_block_num = current_block_height
                first_block = false
            }
        }
        else if(expect_balance===start_balance+app.max_txs_in_round){
			app.end_block_num = current_block_height
            for (let i = app.start_block_num ; i <= app.end_block_num ; i ++){
                let time = []
                for(let j = 0 ; j < app.node_num ; j ++){
                    let obj = {}
                    var block_info = await api.getBlock(web3[j], i)
                    obj[`node${j}`]=`${block_info.timestamp}000`
                    time.push(obj)
                }
                app.report[`block_${i}`] = {
                    num_txs: block_info.transactions.length,
                    timestamp: time,
                    transactions: []
                }
            }
            fs.writeFileSync(`${config.quorum.path.rec_data}/report${testing_time}.json`, JSON.stringify(app.report, null, 2))
            for (let k = 0; k < config.setting.node_num; k++) {
                web3[k].currentProvider.connection.close()
            }
            clearInterval(interval)
        }
    },interval_time)
})()