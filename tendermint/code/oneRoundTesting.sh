gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- 'rm /home/caideyi/Benchmarking/t-tendermint/data/block_commit_time'
node ../../bin/workload.js "tendermint" $1 $2 $3 $4 $5
let end_index=$1*$2*$3+$5
gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- "./Benchmarking/t-tendermint/nodeScript/scp.sh"
node post_process.js $1 $2
node ../../bin/calculate.js "tendermint" $1 $2 $3
echo $end_index
