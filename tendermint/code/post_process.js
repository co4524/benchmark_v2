const getTransactionReceipt = require(`../lib/rpc.js`).getTransactionReceipt
const fs = require('fs')
const config =  require('../../configure.json')
const [INPUT_RATE, DURATION_TIME] = process.argv.slice(2, 4).map(it => parseInt(it))
const transaction_log = fs.readFileSync(config.tendermint.path.transaction_log, 'utf-8').split('\n')
const block_commit_time = fs.readFileSync(config.tendermint.path.block_commit_time, 'utf-8').split('\n').slice(0,-1)   // 28,50,1568105264997   => block_number,transaction_number,block_commit_time

const app = {
    total_txs : 0,
    repeat_count : 1,
    one_period : INPUT_RATE * DURATION_TIME,
    obj : {},
    output : {}
}

block_commit_time.map((it) => {
    app.obj[`block_${it.split(',')[0]}`]={
        "timeStamp" : it.split(',')[2],
        "transactions" : []
    }
    app.total_txs+=parseInt(it.split(',')[1])
})

;(async function () {

    for (let i = 0 ; i < app.total_txs ; i++){
        let tx_block_height = JSON.parse( await getTransactionReceipt(config.tendermint.urls[i%config.tendermint.urls.length], transaction_log[i].split(',')[0]) ).result.height
        app.obj[`block_${tx_block_height}`].transactions.push(transaction_log[i]) 
    } 

    app.total_txs = 0
    block_commit_time.map((it) => {
        app.output[`block_${it.split(',')[0]}`]=app.obj[`block_${it.split(',')[0]}`]
        app.total_txs+=parseInt(it.split(',')[1])
        if(app.total_txs==app.one_period){
            fs.writeFileSync(`${config.tendermint.path.post_process}/Rate${INPUT_RATE}-Sec${DURATION_TIME}-Test${app.repeat_count}.json`, JSON.stringify(app.output, null, '\t'))
            app.output = {}
            app.total_txs = 0
            app.repeat_count += 1
        }
    })

})()

