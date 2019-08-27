// const fs = require('fs');
// const readline = require('readline');
//
//
// var inputStream = fs.createReadStream('RawTx');
// // 將讀取資料流導入 Readline 進行處理
// var lineReader = readline.createInterface({ input: inputStream });
// lineReader.on('line', function(line) {
//
//     // 取得一行行結果
//     console.log('NEW LINE', line);
// });

// reference: https://www.npmjs.com/package/line-by-line

const lr = new (require('line-by-line'))('RawTx')

var i = 0

lr.on('error', err => console.log(err))

lr.on('line', it => {
  console.log('new line', it)

  if (++i > 5) {
    lr.pause()

    setTimeout(() => {
      lr.resume()
    }, 1000)
  }
})

lr.on('end', () => console.log('finished reading'))
