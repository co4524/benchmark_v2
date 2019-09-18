const config = require('../../configure.json')
const keystore = require(config.stellar.path.keystore)
const sdk = require('../lib/sdk.js')
const testAccount = Object.keys(require(config.stellar.path.testAccount))

let keystore_pub = Object.keys(keystore)

sdk.getBalance(testAccount[490000])

console.log(keystore[keystore_pub[999]])