const request = require('request-promise')


module.exports = {
    sendTx: async (baseURL, tx) => {
      return await request({ method: 'POST', url: `${baseURL}/broadcast_tx_commit?tx=${tx}` })
        .catch(err => { throw err })
    },
    tendermintInfo: async (baseURL) => {
      try {
        return JSON.parse(await request(`${baseURL}/status`))
      } catch (err) {
        throw err
      }
    },
    getTransactionFromHash: async (baseURL , tx_hash) => {
      try {
        return JSON.parse(await request(`${baseURL}/tx?hash=0x${tx_hash}`))
      } catch (err) {
        throw err
      }
    }
}
