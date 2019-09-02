api = require("./rpc.js")

testAPI()

async function testAPI(){
    // let res = await api.tendermintInfo("http://10.140.4.0:26657")
    // console.log(res)
    let res = await api.getTransactionFromHash("http://10.140.4.0:26657", process.argv[2] )
    console.log(res.result.height)
}