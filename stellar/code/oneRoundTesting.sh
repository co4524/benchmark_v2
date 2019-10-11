nodeNumber=4
threadNumber=4
inputRate=$1
durationTime=$2
repeatTime=1
sleepTime=30
testingTime=1
let t_inputRate=inputRate/threadNumber
let one_period=inputRate*durationTime
# reset stellarNetwork
cd /home/caideyi/Benchmarking/t-stellar/script/
./killprocess.sh $nodeNumber
./active.sh $nodeNumber $nodeNumber

# create testing account
cd /home/caideyi/benchmark_v2/stellar/code/
node createAccount.js
sleep 10

# reset horizon => reset transaction_log at node0
gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "stellar0" --command="nohup ./resetHorizon.sh > /dev/null 2> /dev/null < /dev/null &"
sleep 5

# workload---send transaction
slice=0
for ((i=0 ; i < $threadNumber ; i ++)){
    node workload $t_inputRate $durationTime $repeatTime $sleepTime $slice &
    let slice=slice+one_period
}

# active monitor - check all transaction done
node monitor.js $inputRate $durationTime $repeatTime

for ((i=0 ; i < $nodeNumber ;i ++)){
	gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "stellar$i" --command="gcloud compute scp transaction_log s-workloader:~/benchmark_v2/stellar/rec_data/node$i"
	#gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "stellar$i" --command="node queryDB.js && gcloud compute scp transaction_log.json s-workloader:~/benchmark_v2/stellar/rec_data/node$i"
}

# post_process
node post_process.js 

# calculate performance
cd /home/caideyi/benchmark_v2/bin/
node calculate.js 'stellar' $inputRate $durationTime $repeatTime $testingTime
