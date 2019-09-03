gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- './Benchmarking/t-tendermint/nodeScript/dataReset.sh'
node workload.js $1 $2 $3 $4 $5
let end_index=$1*$2+$5
node preprocess.js $5 $end_index
gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "tendermint0" -- "./Benchmarking/t-tendermint/nodeScript/scp.sh"
node calculate.js $1 $2 $3
