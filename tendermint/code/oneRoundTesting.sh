gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- './Benchmarking/t-tendermint/nodeScript/dataReset.sh'
node ../../bin/workload.js "tendermint" $1 $2 $3 $4 $5
let end_index=$1*$2*$3+$5
gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- "./Benchmarking/t-tendermint/nodeScript/scp.sh"
node preprocess.js 
node ../../bin/calculate.js "tendermint" $1 $2
echo $end_index
