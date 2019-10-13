array=(
100
200
300
400
500
600
)
DURATION_TIME=60
Benchmark() {
	for i in "${array[@]}"
	do
		./oneRoundTesting.sh $i $DURATION_TIME
	done
}

Benchmark
#DURATION_TIME=120
#Benchmark
