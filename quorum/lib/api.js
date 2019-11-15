
module.exports = {

    getTransactionReceipt: (web3, tx_hash) => web3.eth.getTransaction(tx_hash),

    sendTx: (web3, raw_tx) => web3.eth.sendSignedTransaction(raw_tx),

    getCurrentBlock: (web3) => web3.eth.getBlockNumber(),

    getBlock: (web3, block_num) => web3.eth.getBlock(block_num),

    getBalance: (web3, address) => web3.eth.getBalance(address)

}