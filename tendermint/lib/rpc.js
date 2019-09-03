const request = require('request-promise')


module.exports = {
    sendTx: async (baseURL, tx) => request({ method: 'POST', url: `${baseURL}/broadcast_tx_commit?tx=${tx}` }) ,

    tendermintInfo: async (baseURL) => request(`${baseURL}/status`) ,

    getTransactionFromHash: async (baseURL , tx_hash) => request(`${baseURL}/tx?hash=0x${tx_hash}`)
}
