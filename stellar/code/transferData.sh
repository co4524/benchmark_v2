nodeNumber=$1
for ((i=0 ; i < $nodeNumber ;i ++)){
    gcloud compute --project "caideyi" ssh --zone "asia-east1-b" "stellar$i" --command="node queryDB.js && gcloud compute scp transaction_log.json s-workloader:~/benchmark_v2/stellar/rec_data/node$i"
}