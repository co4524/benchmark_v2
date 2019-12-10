const config = require('../../configure.json')
const ws_port = config.setting.port.web_socket
let utils = require('web3-utils');
const Web3 = require('web3')
const web3 = []
config.quorum.nodeIp.map((it, index) => {
    web3[index] = new Web3(new Web3.providers.WebsocketProvider(`ws://${it}:${ws_port}`))
})
const txs = Object.keys(require(config["quorum"].path.raw_transaction))
const hash = Object.values(require(config["quorum"].path.raw_transaction))
const api = require("./api.js")

;(async function () {
    let res

    //res = await api.sendTx(web3[0], txs[0])
    //console.log(res)
    // res = await api.getBalance(web3[0], config.setting.des_address)
    // console.log(res)
    // res = await api.getCurrentBlock(web3[1])
    // console.log(res)
    //res = await api.getTransactionReceipt(web3[1], hash[0])
    //console.log(res)
    res = await api.getBlock(web3[0], 1)
    console.log(res)
    console.log(utils.hexToNumber(res.timestamp))
    // console.log(parseInt(res.timestamp.substring(2,12), 16))
    // console.log(Web3Utils.hexToNumber(res.timestamp))
    
    web3[0].currentProvider.connection.close()
    web3[1].currentProvider.connection.close()
})()
