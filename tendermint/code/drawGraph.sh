PATH_CONFIGURE=$HOME/benchmark_v2/configure.json

array=(
100
200
400
800
1600
3200
6400
8000
10000
12800
)

DURATION_TIME=$(cat $PATH_CONFIGURE | jq -r '.setting.duration_time')
node_num=$(cat $PATH_CONFIGURE | jq -r '.setting.node_num')
model=$(cat $PATH_CONFIGURE | jq -r '.setting.model')
start=$(cat $PATH_CONFIGURE | jq -r '.setting.micro_graph.start')
end=$(cat $PATH_CONFIGURE | jq -r '.setting.micro_graph.end')
report_path=$(cat $PATH_CONFIGURE | jq -r '.tendermint.path.result')

#str=$(cat report1.json | grep E3457BAD4DC783F45F6A4F60E7EFDDBFA24EC2EDD3C094029AC39ACB310D20D8)
#first_tx_time=$(echo $str | grep '[0-9]\{19,\}')
for i in "${array[@]}"
do
    path="$report_path/$model/R$i-T$DURATION_TIME/rec_data/report1.json"    # testing time default : 1
    if [ -f "$path" ]; then
        node cal.js $node_num $i $DURATION_TIME $model
    else
        echo "path : $path doesnt exists"
    fi
done

mkdir -p /home/caideyi/report/$model/graph
for i in "${array[@]}"
do 
    path="$report_path/$model/R$i-T$DURATION_TIME/rec_data/node0/data"       # get micro data from node{0}  -> default 0
    if [ -d "$path" ]; then 
	    python3 cpuplot.py $start $end $i $model
    else
        echo "path : $path doesnt exists"
    fi
done
