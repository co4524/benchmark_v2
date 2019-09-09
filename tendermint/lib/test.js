api = require("./rpc.js")
const sendTx = require('../lib/rpc.js').sendTx

testAPI()

async function testAPI(){
    // let res = await api.tendermintInfo("http://10.140.4.0:26657")
    // console.log(res)
    let res = await sendTx("http://10.140.4.0:26657", process.argv[2] )
    console.log(typeof(res),'\n',res)
}