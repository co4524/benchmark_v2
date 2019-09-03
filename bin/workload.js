const sendTx = require(`../${process.argv[2]}/lib/rpc.js`).sendTx
const fs = require('fs')
const config =  require('../configure.json')

const INPUT_RATE = parseInt( process.argv[3] ,10)
const DURATION_TIME = parseInt( process.argv[4] ,10)
const REPEAT = parseInt( process.argv[5] ,10)
const SLEEP_TIME = parseInt( process.argv[6] ,10)
const SlICE = parseInt( process.argv[7] ,10)  // for testing

const app = {
  max_txs_in_period: INPUT_RATE * DURATION_TIME,
  max_txs_in_round: INPUT_RATE * DURATION_TIME * REPEAT,
  sent_log: '',
  sent_tx: 0
}
console.log(app)

// reset txrequest_time file
if (fs.existsSync(config[process.argv[2]].path.tx_request_time))
  fs.unlinkSync(config[process.argv[2]].path.tx_request_time)
 
const txs = fs.readFileSync(config[process.argv[2]].path.raw_tx, 'utf-8').split('\n').slice(SlICE)  //SLICE for testing

const onePeriodTest = async () => {
	app.start = 0
	return new Promise((resolve , reject) => {
		let interval = setInterval(() => {
			console.log(`Send transaction ${Date.now()}`)
			for (let i = 0; i < INPUT_RATE; i++) {
				sendTx(config[process.argv[2]].urls[i%config[process.argv[2]].urls.length], txs[app.sent_tx++])
				app.sent_log += `${txs[app.start++]}, ${Date.now()}\n`
			}

			if (app.start == app.max_txs_in_period){
				clearInterval(interval)
				fs.appendFileSync(config[process.argv[2]].path.tx_request_time, app.sent_log)
				app.sent_log = ''
				resolve()
			}
		}, 1000)
	})
}

;(async function () {
	await onePeriodTest()
	console.log(app.sent_tx , app.max_txs_in_round)
	let interval = setInterval( async () => {
		await onePeriodTest()
		console.log(app.sent_tx , app.max_txs_in_round)
		if(app.sent_tx==app.max_txs_in_round){
			clearInterval(interval)
		}
	}, (DURATION_TIME + SLEEP_TIME) * 1000)
})()
