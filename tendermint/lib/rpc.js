const request = require('request-promise')


module.exports = {
    sendTx: (baseURL, tx) => {
      request({ method: 'POST', url: `${baseURL}/broadcast_tx_commit?tx=${tx}` })
        .catch(err => { throw err })
    },
    tendermintInfo: async (baseURL) => {
      try {
        return JSON.parse(await request.get(`${baseURL}/status`))
      } catch (err) {
        throw err
      }
    }
}
