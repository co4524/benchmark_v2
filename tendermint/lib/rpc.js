const request = require('request-promise')

const _tendermintInfo = async (baseURL) => {
  try {

    return JSON.parse(await request.get(`${baseURL}/status`))

  } catch (err) {
    throw err
  }
}

const sendTx = (baseURL, tx) => {
  request({ method: 'POST', url: `${baseURL}/broadcast_tx_commit?tx=${tx}` })
    .catch(err => { throw err })
}


// async function tendermintInfo( baseURL ) {
//     try {
//         let result;
//         let error;
//         let options = {
//             url: baseURL + '/status',
//         };
//
//         await request.get(options, (err, res, body) => {
//             if (err) error = err;
//             result = res;
//         });
//         if (error) throw error;
//
//         return JSON.parse(result.body);
//     } catch (err) {
//         throw err;
//     }
// }

async function sendTx( baseURL , tx) {


        let options = {
            url: baseURL + '/broadcast_tx_commit?tx=' + tx ,
        };

        request.post(options, (err) => {
            if (err) error = err;
        });

}

module.exports = {
    sendTx: sendTx ,
    tendermintInfo: _tendermintInfo
}
