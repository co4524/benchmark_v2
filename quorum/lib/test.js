const config = require('../../configure.json')
const Web3 = require('web3')
const web3 = []
config.quorum.nodeIp.map((it, index) => {
    web3[index] = new Web3(new Web3.providers.WebsocketProvider(`ws://${it}:22000`))
})
const api = require("./api.js")

;(async function () {
    let res = await api.getTransactionReceipt(web3[0], "0x80821547e8584520b4c565c027708959ed186af589090e27551f52e6f37358e6")
    console.log(res.blockNumber)
    res = await api.getCurrentBlock(web3[0])
    console.log(res)
    web3[0].currentProvider.connection.close()
    web3[1].currentProvider.connection.close()
})()
