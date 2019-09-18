const StellarSdk = require('stellar-sdk')
const config = require('../../configure.json')
const rootAccount = require(config.stellar.path.rootAccount)
const keystore = require(config.stellar.path.keystore)
const testAccount = Object.keys(require(config.stellar.path.testAccount))
const sdk = require('../lib/sdk.js')
const keystore_pub = Object.keys(keystore)
//sdk.getBalance(keystore[101])
const option ={
    startAccont : 10, // < 100
    startAmount : 2000000, 
    operation_count : 100,
    total_account : 500000
}
;(async function(){

    let res = []
    await sdk.createAccount( StellarSdk.Keypair.fromSecret(rootAccount.privateKey), 500000000, option.startAccont, keystore_pub.slice(0,0+option.startAccont))

    for (let i = 0 ; i < option.startAccont ; i ++){
        let key_pair = StellarSdk.Keypair.fromSecret(keystore[keystore_pub[i]])
        let account_pub = keystore_pub.slice(option.startAccont+(i*option.operation_count), option.startAccont+((i+1)*option.operation_count))
        res[i] = sdk.createAccount( key_pair, option.startAmount, option.operation_count, account_pub)
    }
    await Promise.all(res)
    for (let i = 0 ; i < option.total_account/(1000*option.operation_count) ; i++){
        await createAccount(i*(1000*option.operation_count))
        console.log("done",i)
    }

})()

async function createAccount(count){

    let res = []
    for (let i = 0 ; i < 500 ; i ++){
        let key_pair = StellarSdk.Keypair.fromSecret(keystore[keystore_pub[i]])
        let account_pub = testAccount.slice(count+(i*option.operation_count), count+((i+1)*option.operation_count))
        res[i] = sdk.createAccount( key_pair, 1000, option.operation_count, account_pub)
    }
    await Promise.all(res)
    console.log("done")
    for (let i = 500 ; i < 1000 ; i ++){
        let key_pair = StellarSdk.Keypair.fromSecret(keystore[keystore_pub[i]])
        let account_pub = testAccount.slice(count+(i*option.operation_count), count+((i+1)*option.operation_count))
        res[i] = sdk.createAccount( key_pair, 1000, option.operation_count, account_pub)
    }
    await Promise.all(res)
}