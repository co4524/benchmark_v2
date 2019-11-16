#!/bin/sh

## setting
tx_rate=$1
path_configure=$HOME/benchmark_v2/configure.json
repeat=1
thread_num=1
test_time=1

path_testnet=$(cat $path_configure | jq -r '.quorum.path.node_config')
path_rec=$(cat $path_configure | jq -r '.quorum.path.rec_data')
path_log=$(cat $path_configure | jq -r '.node.log')
path_report=$(cat $path_configure | jq -r '.quorum.path.report_path')
path_micro_data=$(cat $path_configure | jq -r '.node.micro_data')
duration_time=$(cat $path_configure | jq -r '.setting.duration_time')
sleep_time=$(cat $path_configure | jq -r '.setting.sleep_time')
node_num=$(cat $path_configure | jq -r '.setting.node_num')
model=$(cat $path_configure | jq -r '.setting.model')
instance_name=$(cat $path_configure | jq -r '.setting.instance_name')
dispatcher_name=$(cat $path_configure | jq -r '.setting.dispatcher_name')
region_setting=$(cat $path_configure | jq -r '.setting.region')
gcloud_proj_name=$(cat $path_configure | jq -r '.setting.gcloud_proj_name')
region_list=$(cat $path_configure | jq -r '.region' | jq 'keys')
region_num=$(cat $path_configure | jq -r '.region' | jq 'length')
block_time=$(cat $path_configure | jq -r '.setting.block_time')

thread_tx_rate=`expr $tx_rate / $thread_num`
one_period=`expr $thread_tx_rate \* $duration_time`
iter=`expr $node_num - 1`

## modify config
node ../../../modconfig.js

## start the nodes
# 1.build config
sh configGenerate.sh $path_testnet $node_num "0"  # 0 is leader node number

# 2.transfer config & start the node

for node_index in $(seq 0 $iter)
do
    region_index=`expr $node_index % $region_num`
    region=$(echo $region_list | jq -r .[$region_index])
    echo "transfer config data to instance : $instance_name$node_index region $region"
    gcloud compute scp --project "$gcloud_proj_name" --recurse "$path_testnet/node$node_index/data" "$instance_name$node_index":~/. --zone "$region"
    gcloud compute --project "$gcloud_proj_name" ssh --zone "$region" "$instance_name$node_index" \
    --command="sh startQuorum.sh data 22000 20200 30300 $block_time" &   # [data_path, web_socket port, rpc port, node_port, block_time]
done
sleep 120

## send transactions & monitor result
# 1.workload send transaction multi thread
for i in $(seq 1 $thread_num)
do
    slice=0
    node ../workload $thread_tx_rate $duration_time $repeat $sleep_time $slice &
    slice=`expr $slice + $one_period`
done

# active monitor - check all transaction done
node ../txMonitor.js $tx_rate $duration_time $repeat

## post process
# 1.get log
rm -r $path_rec/node*
for node_index in $(seq 0 $iter)
do
    node_path=$path_rec/node$node_index
	if [ ! -d "$node_path" ]; then
		mkdir -p $node_path
	fi
    echo "transfer log from $instance_name$node_index to $dispatcher_name"
    region_index=`expr $node_index % $region_num`
    region=$(echo $region_list | jq -r .[$region_index])
    gcloud compute --project "$gcloud_proj_name" ssh --zone "$region" "$instance_name$node_index" \
    --command="gcloud compute scp --recurse $path_log $dispatcher_name:$path_rec/node$node_index --zone asia-east1-b"
done

# 2.post_process
node ../postprocess.js

## kill nodes & get micro data

for node_index in $(seq 0 $iter)
do
    echo "transfer micro_data from $instance_name$node_index to $dispatcher_name"
    region_index=`expr $node_index % $region_num`
    region=$(echo $region_list | jq -r .[$region_index])
    gcloud compute --project "$gcloud_proj_name" ssh --zone "$region" "$instance_name$node_index" \
    --command="sh killQuorum.sh; gcloud compute scp --project $gcloud_proj_name --recurse $path_micro_data $dispatcher_name:$path_rec/node$node_index --zone asia-east1-b"
done

## copy report to report dir

path=$path_report/$model/R$tx_rate-T$duration_time
if [ -d "$path" ]; then
    rm -r $path
fi
mkdir -p $path
cp -r $path_rec $path

## calculate performance && draw graph
cd ../../../bin/
sh drawGraph.sh $tx_rate
