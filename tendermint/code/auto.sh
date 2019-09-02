
gcp(){
    for((j=0 ; j < $3 ; j++)){
        echo "transfer node$j"
        gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint$j" --command="./Benchmarking/t-tendermint/data/reset.sh $1 $2 $j"
    }
}
MODEL="4-1"
INPUT_RATE=$1
let INPUT_RATE_SPLIT=INPUT_RATE/4
START_SLICE=$2

for ((i=0 ; i < 5 ; i++)){
    let testing_time=i+1
    node workload.js $INPUT_RATE_SPLIT 1 1 $START_SLICE &
    let START_SLICE=START_SLICE+INPUT_RATE_SPLIT
    node workload2.js $INPUT_RATE_SPLIT 1 1 $START_SLICE &
    let START_SLICE=START_SLICE+INPUT_RATE_SPLIT
    node workload3.js $INPUT_RATE_SPLIT 1 1 $START_SLICE &
    let START_SLICE=START_SLICE+INPUT_RATE_SPLIT
    node workload4.js $INPUT_RATE_SPLIT 1 1 $START_SLICE 
    let START_SLICE=START_SLICE+INPUT_RATE_SPLIT
    gcp $MODEL $testing_time 1
    sleep 100
}

cd /home/caideyi/recTesting/$MODEL

for ((i=1 ; i < 6 ; i++)){
    echo "Testing $i"
    echo ""
    echo "============="
    for((j=0 ; j < 1 ; j++)){
        echo "Node $j"
        #sed -e 1b -e '$!d' $i/t$j/data/txReceiveTime
        start=$(sed -n '1p' $i/t$j/data/txReceiveTime)
        end=$(tail -1 $i/t$j/data/txReceiveTime)
        echo "StartTime :　${start:8:13}"
        echo "EndTime : ${end:8:13}"
        echo "============="
    }
}

echo "END_SLICE = $START_SLICE"