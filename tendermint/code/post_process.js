const getTransactionReceipt = require(`../lib/rpc.js`).getTransactionReceipt
const fs = require('fs')
const config =  require('../../configure.json')
const transaction_log = fs.readFileSync(config.tendermint.path.transaction_log, 'utf-8').split('\n')

const app = {
    hash : [],
    hash_info : {},   // "tendermintHash": {"time" : "timeStamp" , "blockheight" : "blockHeight"}
    blockHeight_time : {},
    block : []
}

fs.existsSync(config.tendermint.path.tx_request_time) && fs.unlinkSync(config.tendermint.path.tx_request_time)
fs.existsSync(config.tendermint.path.block_tx_num) && fs.unlinkSync(config.tendermint.path.block_tx_num)

let log = ''
transaction_log.map((it,index) => {
    if(index%11==0 && index!=0) {
        app.hash_info[JSON.parse(log).result.hash]= {"time": JSON.parse(log).result.time , "blockHeight": ""}
        log = ''
    }
    log+=`${it}\n`
})
app.hash = Object.keys(app.hash_info)

;(async function () {

    for (let i = 0 ; i < app.hash.length ; i++){
        app.hash_info[app.hash[i]].blockHeight = JSON.parse( await getTransactionReceipt(config.tendermint.urls[i%config.tendermint.urls.length], app.hash[i]) ).result.height  
    } 

    app.blockHeight_time[ app.hash_info[app.hash[0]].blockHeight ]= [app.hash_info[app.hash[0]].time]
    app.block.push(app.hash_info[app.hash[0]].blockHeight)
    for (let i = 1 ; i < app.hash.length ; i++){
        let blockHeight = app.hash_info[app.hash[i]].blockHeight
        let newObj = true
        for(let j = 0 ; j < app.block.length ; j++){
            if(blockHeight===app.block[j]) {
                newObj = false
                app.blockHeight_time[ blockHeight ].push(app.hash_info[app.hash[i]].time)
                break
            }
        }
        if(newObj) {
            app.blockHeight_time[ blockHeight ] = [app.hash_info[app.hash[i]].time]
            app.block.push(blockHeight)
        }
    }
    
    app.block = Object.keys(app.blockHeight_time) ;
    for (let i = 0 ; i < app.block.length ; i++){
        let time_seqence = app.blockHeight_time[app.block[i]]
        let time = ''
        fs.appendFileSync(config.tendermint.path.block_tx_num, `${app.blockHeight_time[app.block[i]].length}\n`)
        for (let j = 0 ; j < app.blockHeight_time[app.block[i]].length ; j++){
            time += `${time_seqence[j]}\n`
        }
        fs.appendFileSync(config.tendermint.path.tx_request_time, time)
    }


})()
