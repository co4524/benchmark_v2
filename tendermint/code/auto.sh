INPUT_RATE=$2
START_SLICE=$3
THREAD_NUM=4
NODE_NUM=$1
#MODEL="$THREAD_NUM-$NODE_NUM"  # $3 thread_num,$4 node_num
TESTING_TIME=5
let INPUT_RATE_SPLIT=INPUT_RATE/THREAD_NUM

for ((i=0 ; i < $TESTING_TIME ; i++)){
    echo "Testing $i"
    let testing_time=i+1
    for ((k=0 ; k < $THREAD_NUM ; k++)){
        node recTesting.js $NODE_NUM $INPUT_RATE_SPLIT $START_SLICE &
        let START_SLICE=START_SLICE+INPUT_RATE_SPLIT
    }
    sleep 120
    node stat.js $NODE_NUM
}

echo $START_SLICE



# INPUT_RATE=$1
# START_SLICE=$2
# THREAD_NUM=$3
# NODE_NUM=$4
# MODEL="$THREAD_NUM-$NODE_NUM"  # $3 thread_num,$4 node_num
# TESTING_TIME=$5
# let INPUT_RATE_SPLIT=INPUT_RATE/$3

# gcp(){
#     for((j=0 ; j < $3 ; j++)){
#         echo "transfer node$j"
#         gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint$j" --command="./scp.sh $1 $2 $j"
#     }
# }

# for ((i=0 ; i < $TESTING_TIME ; i++)){
#     let testing_time=i+1
#     for ((k=0 ; k < $3 ; k++)){
#         node recTesting.js $4 $INPUT_RATE_SPLIT $START_SLICE &
#         let START_SLICE=START_SLICE+INPUT_RATE_SPLIT
#     }
#     sleep 30
#     gcp $MODEL $testing_time $4
# }

# cd /home/caideyi/recTesting2/$MODEL

# let count=$TESTING_TIME+1
# for ((i=1 ; i < $count ; i++)){
#     echo "Testing $i"
#     echo ""
#     echo "============="
#     for((j=0 ; j < $NODE_NUM ; j++)){
#         echo "Node $j"
#         DIRECTORY="$i/t$j/data/"
#         start=$(sed -n '1p' $i/t$j/recTime)
#         end=$(tail -1 $i/t$j/recTime)
#         if [ -d "$DIRECTORY" ]; then
#             start=$(sed -n '1p' $i/t$j/data/recTime)
#             end=$(tail -1 $i/t$j/data/recTime)
#         fi
#         echo "StartTime :　${start:215:225}"
#         echo "EndTime : ${end:215:225}"
#         echo "============="
#     }
# }

# echo "END_SLICE = $START_SLICE"

# cd /home/caideyi/recTesting2/
# cp -r $MODEL "T$THREAD_NUM-N$NODE_NUM-R$INPUT_RATE"