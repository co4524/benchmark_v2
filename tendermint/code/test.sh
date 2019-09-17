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

DURATION_TIME=$2
BLOCK_SIZE=$1

for i in "${array[@]}"
do 
    node blocksize_cal.js $BLOCK_SIZE $i $DURATION_TIME
done
