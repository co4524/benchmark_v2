const API = require('../lib/rpc.js')
const fs = require('fs')
const URL = require("../data/baseURL.json")
const PATH_CONFIGURE =  require('../configure.json')
const PATH_HOME = PATH_CONFIGURE.home_path
const PATH_REQEST_TIME = `${PATH_HOME}/benchmark_v2/tendermint/res/txRequestTime`
const PATH_HASH_TX = `${PATH_HOME}/benchmark_v2/tendermint/res/HashTx`
const PATH_PREPROCESS_REQEST_TIME = `${PATH_HOME}/benchmark_v2/tendermint/res/preprocess_txRequestTime`

const hash_list = fs.readFileSync(PATH_HASH_TX, 'utf-8').split('\n')
const tx_request_time_list = fs.readFileSync(PATH_REQEST_TIME, 'utf-8').split('\n')

const app = {
    start : parseInt( process.argv[2] ,10) ,    // for testing , start transaction index
    end : parseInt( process.argv[3] ,10) ,      // for testing , end transaction index
    ledger_id : [] ,
    time : {}
}

async function getLedgerId(){

    let index = 0
    let reqestTime = []
    let preprocess_request_time = ''

    for (let i = app.start ; i < app.end ; i++){
        app.ledger_id[index] = (await API.getTransactionFromHash(URL[i%URL.length], hash_list[i] )).result.height
        index++
    }
    //console.log(app.ledger_id)

    let stat = {}
    //statistics tx's Info
    app.ledger_id.forEach(function(item) {
        stat[item] = stat[item] ? stat[item] + 1 : 1
    })
    console.log(stat)

    //Get requestTime for each block
    for (let i = 0 ; i < Object.keys(stat).length ; i ++ ){
        app.time[Object.keys(stat)[i]] = reqestTime.slice();
    }
    
    for (let i = 0 ; i < tx_request_time_list.length ; i ++){
        for (let j = 0 ; j < Object.keys(stat).length ; j ++ ){

            if ( app.ledger_id[i] == Object.keys(stat)[j] ){
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
    fs.appendFileSync(PATH_PREPROCESS_REQEST_TIME, preprocess_request_time)
}

if (fs.existsSync(PATH_PREPROCESS_REQEST_TIME))
  fs.unlinkSync(PATH_PREPROCESS_REQEST_TIME)

getLedgerId()
