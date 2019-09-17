array=(
100
200
400
800
1600
3200
6400
12800
)
DURATION_TIME=60
Benchmark() {
	for i in "${array[@]}"
	do
		./oneRoundTesting.sh $i $DURATION_TIME
	done
}

Benchmark
DURATION_TIME=120
Benchmark
