const config = require('../../configure.json')
const fs = require('fs')
const keystore = require(config.stellar.path.keystore)
const sdk = require('../lib/sdk.js')
//const testAccount = Object.keys(require(config.stellar.path.testAccount))
//const obj = require('./raw_tx.json')
let keystore_pub = Object.keys(keystore)



;(async function(){

    let res = await sdk.genRawTx(keystore[keystore_pub[0]],keystore_pub[1])
    //console.log(keystore[keystore_pub[0]],keystore_pub[1])
    // console.log(res1.hash().toString('hex'))
    raw_tx = encodeURIComponent(res.toEnvelope().toXDR().toString('hex'))
    console.log(raw_tx)
    // console.log("des",config.stellar.destination.address[0])
    // console.log("src",keystore[keystore_pub[0]])
    // console.log(config.stellar.node_ip[0])
    // sdk.sendTransaction(config.stellar.node_ip[0],keystore[keystore_pub[0]],config.stellar.destination.address[0])
    // console.log("1234")
    // sdk.sendTransaction(config.stellar.node_ip[0],keystore[keystore_pub[1]],config.stellar.destination.address[0])
    //console.log(res)
    //await sdk.sendTx(raw_tx)

    // let res = JSON.parse(await sdk.stellarInfo()).info.ledger.num
    // console.log(res)
//    let res = JSON.parse(await sdk.getLedgerInfo(config.stellar.urls[0],1230))
//    console.log(res)
    //let res = JSON.parse(await sdk.getHorizonInfo()).history_latest_ledger
    //console.log(res)
    // let res = JSON.parse(await sdk.getBalance(config.stellar.destination.address[0])).balances[0].balance
    // console.log(parseInt(res,10))
})()
