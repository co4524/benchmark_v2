TX_RATE=$1
DURATION_TIME=$2
REPEAT=1
SLEEP_TIME=180
SLICE=0
THREAD_NUM=4
TEST_TIME=1
let SPLIT_TX_RATE=TX_RATE/THREAD_NUM
let ONE_PERIOD=SPLIT_TX_RATE*DURATION_TIME
NODE_NUM=4

model=tendermint
block_size=1356800
core_num=1core-Normal

# reset network
cd /home/caideyi/Benchmarking/t-tendermint/script
./command.sh active $NODE_NUM $NODE_NUM $model $block_size
cd /home/caideyi/benchmark_v2/tendermint/code
#for ((i = 0 ; i < $NODE_NUM ;i++)){
#    gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- 'rm /home/caideyi/Benchmarking/t-tendermint/data/block_commit_time'
#}
sleep 5
# multi thread workload
echo "start Testing"
for ((i = 1 ; i < $THREAD_NUM ; i++)){
    node ../../bin/workload.js "tendermint" $SPLIT_TX_RATE $DURATION_TIME $REPEAT $SLEEP_TIME $SLICE $i&
    let SLICE=SLICE+ONE_PERIOD
}
node ../../bin/workload.js "tendermint" $SPLIT_TX_RATE $DURATION_TIME $REPEAT $SLEEP_TIME $SLICE $THREAD_NUM
let SLICE=SLICE+ONE_PERIOD
sleep 5
cd /home/caideyi/benchmark_v2/tendermint/code
# calculate performance
node merge.js $THREAD_NUM
for ((i = 0 ; i < $NODE_NUM ;i++)){
    gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint$i" -- "./Benchmarking/t-tendermint/nodeScript/scp2.sh $i"
}
node post_process.js $TX_RATE $DURATION_TIME $REPEAT 0 $TEST_TIME
node ../../bin/calculate.js "tendermint" $TX_RATE $DURATION_TIME $REPEAT $TEST_TIME
cd /home/caideyi/Benchmarking/t-tendermint/script
./command.sh kill $NODE_NUM
for ((i = 0 ; i < $NODE_NUM ;i++)){
    gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint$i" -- "./Benchmarking/t-tendermint/nodeScript/scp.sh $i"
}

path=/home/caideyi/report/$core_num/R$TX_RATE-T$DURATION_TIME
rm -r $path
mkdir -p $path
cp -r /home/caideyi/benchmark_v2/tendermint/rec_data $path
