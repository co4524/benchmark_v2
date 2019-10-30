array=(
100
200
300
400
#500
#600
#3200
#6400
#12800
)

DURATION_TIME=60
BLOCK_SIZE=$1

for i in "${array[@]}"
do 
    node core_cal.js $BLOCK_SIZE $i $DURATION_TIME
done
