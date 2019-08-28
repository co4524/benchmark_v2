api = require("./rpc.js")

testAPI()

async function testAPI(){
    // let res = await api.tendermintInfo("http://10.140.4.0:26657")
    // console.log(res)
    api.sendTx("http://10.140.4.0:26657","0x123ab4")
    api.sendTx("http://10.140.4.0:26657","0x123cd4")
}