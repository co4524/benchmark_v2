const request = require('request-promise')

module.exports = {

    getTransactionFromHash: (baseURL, tx_hash) => request(`${baseURL}/tx?hash=0x${tx_hash}`),

    sendTx: (baseURL, tx) => request({ method: 'POST', url: `${baseURL}/broadcast_tx_commit?tx=${tx}` }),

    tendermintInfo: (baseURL) => request(`${baseURL}/status`)

}
