path_configure=$HOME/benchmark_v2/configure.json
transaction_rate=$(cat $path_configure | jq -r '.setting.transaction_rate')
iter=$(cat $path_configure | jq -r '.setting.transaction_rate' |  jq 'length')
iter=`expr $iter - 1`

Benchmark() {
	for index in $(seq 0 $iter)
    do
        tx_rate=$(echo $transaction_rate | jq -r ".[$index]")
        sh oneRoundTest.sh $tx_rate 
	done
}

Benchmark