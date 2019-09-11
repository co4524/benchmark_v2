THREAD_NUM=$6
TX_RATE=$1
SLICE=$5
DURATION_TIME=$2
TEST_TIME=$7
let SPLIT_TX_RATE=TX_RATE/THREAD_NUM
let ONE_PERIOD=SPLIT_TX_RATE*DURATION_TIME
cd /home/caideyi/Benchmarking/t-tendermint/script
./command.sh kill 4
./command.sh active 4 4
cd /home/caideyi/benchmark_v2/tendermint/code
gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- 'rm /home/caideyi/Benchmarking/t-tendermint/data/block_commit_time'
sleep 10
echo "start Testing"
for ((i = 1 ; i < $THREAD_NUM ; i++)){
node ../../bin/workload.js "tendermint" $SPLIT_TX_RATE $DURATION_TIME $3 $4 $SLICE $i&
let SLICE=SLICE+ONE_PERIOD
}
node ../../bin/workload.js "tendermint" $SPLIT_TX_RATE $DURATION_TIME $3 $4 $SLICE $THREAD_NUM
let SLICE=SLICE+ONE_PERIOD
sleep 5
node merge.js $THREAD_NUM
#[INPUT_RATE,DURATION_TIME,REPEAT,SLEEP_TIME,SLICE]
gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- "./Benchmarking/t-tendermint/nodeScript/scp.sh"
node post_process.js $1 $2 $3 $5 $THREAD_NUM $TEST_TIME
node ../../bin/calculate.js "tendermint" $1 $2 $3 $THREAD_NUM $TEST_TIME
echo $SLICE
