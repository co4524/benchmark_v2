array=(
100
200
300
400
)
DURATION_TIME=60
BLOCK_SIZE=3000
Benchmark() {
	for i in "${array[@]}"
	do
		./oneRoundTesting.sh $i $DURATION_TIME $BLOCK_SIZE
	done
}

Benchmark
