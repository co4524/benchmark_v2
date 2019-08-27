const fs = require('fs');
const readline = require('readline');


var inputStream = fs.createReadStream('RawTx');
// 將讀取資料流導入 Readline 進行處理 
var lineReader = readline.createInterface({ input: inputStream });
lineReader.on('line', function(line) {

    // 取得一行行結果
    console.log('NEW LINE', line);
});