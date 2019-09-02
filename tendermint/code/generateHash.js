const API = require('../lib/rpc.js')
const fs = require('fs')
const PATH_CONFIGURE =  require('../configure.json')
const PATH_HOME = PATH_CONFIGURE.home_path
const PATH_HASH_TX = `${PATH_HOME}/benchmark_v2/tendermint/res/HashTx`
const PATH_RAW_TX = `${PATH_HOME}/benchmark_v2/tendermint/res/RawTx`
const URL = require("../data/baseURL.json")
const txs = fs.readFileSync(PATH_RAW_TX, 'utf-8').split('\n')
const app = {
    tx_index : 0 ,
    raw_tx_size : 1000000 ,
    batch_size : 10000 , 
    first_write : true
}

const generateHash = async () => {

    let hash_list=[]
    console.log(`Sending transacions ${app.batch_size}`)
    for (let i = 0 ; i < app.batch_size ; i ++){
        hash_list[i] = API.sendTx(URL[i%URL.length], txs[app.tx_index++])
    }

    Promise.all(hash_list)
    for(let i=0 ; i < hash_list.length ; i++){
        hash_list[i] = JSON.parse(await hash_list[i]).result.hash
    }

    if (app.first_write == true){
        console.log(`WiteFile ${hash_list.length}`)
        fs.writeFileSync(PATH_HASH_TX, hash_list.join('\n'))
        fs.appendFileSync(PATH_HASH_TX, "\n")
        app.first_write = false
    }
    else {
        console.log(`AppendFile ${hash_list.length}`)
        fs.appendFileSync(PATH_HASH_TX, hash_list.join('\n'))
        fs.appendFileSync(PATH_HASH_TX, "\n")
    }
    hash_list = ''

    console.log(`Now_tx_index : ${app.tx_index}`)
    return new Promise((resolve,reject) =>{
        resolve()
    })

}
console.log(`TransactionSize ${txs.length}`)

async function main(){
    for(let i = 0 ; i < app.raw_tx_size/app.batch_size ; i++){
        console.log(`Round ${i}`)
        await generateHash()
    }
}


main()
