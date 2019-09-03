const getTransactionReceipt = require(`../lib/rpc.js`).getTransactionReceipt
const fs = require('fs')
const config =  require('../../configure.json')
const hash_list = fs.readFileSync(config.tendermint.path.raw_tx_hash, 'utf-8').split('\n')
const tx_request_time_list = fs.readFileSync(config.tendermint.path.tx_request_time, 'utf-8').split('\n')

const app = {
    start : parseInt( process.argv[2] ,10) ,    // for testing , start transaction index
    end : parseInt( process.argv[3] ,10) ,      // for testing , end transaction index
    block_height : [] ,
    time : {}
}

if (fs.existsSync(config.tendermint.path.preprocess_tx_request_time))
  fs.unlinkSync(config.tendermint.path.preprocess_tx_request_time)

;(async function () {

    let index = 0
    let reqestTime = []
    let preprocess_request_time = ''

    for (let i = app.start ; i < app.end ; i++){
        app.block_height[index] = JSON.parse( await getTransactionReceipt(config.tendermint.urls[i%config.tendermint.urls.length], hash_list[i]) ).result.height  //hash_list[Object.keys(hash_list)[i]]
        index++
    }
    //console.log(app.block_height)

    let stat = {}
    //statistics block's Info
    app.block_height.forEach(function(item) {
        stat[item] = stat[item] ? stat[item] + 1 : 1
    })
    console.log(stat)

    //Get requestTime for each block
    for (let i = 0 ; i < Object.keys(stat).length ; i ++ ){
        app.time[Object.keys(stat)[i]] = reqestTime.slice();
    }

    for (let i = 0 ; i < tx_request_time_list.length ; i ++){
        for (let j = 0 ; j < Object.keys(stat).length ; j ++ ){

            if ( app.block_height[i] == Object.keys(stat)[j] ){  // 
                app.time[Object.keys(stat)[j]].push(tx_request_time_list[i].split(', ')[1]);
                break;
            }
        }
    }
    //console.log(app.time)
    for (let i = 0 ; i < Object.keys(stat).length ; i ++){
        let arr = app.time[Object.keys(stat)[i]] 
        for (let j = 0 ; j < arr.length ; j ++){
        preprocess_request_time += `${arr[j]}\n`
        }
    }
    fs.appendFileSync(config.tendermint.path.preprocess_tx_request_time, preprocess_request_time)

})()
