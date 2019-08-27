const ethTx = require('ethereumjs-tx');
const fs = require('fs');

const PATH_CONFIGURE =  require('../configure.json')
const PATH_HOME = PATH_CONFIGURE.home_path
const PATH_PRIVKEY = PATH_HOME + '/benchmark_v2/tendermint/src/testAccount-privKey'
const PATH_RAW_TX = PATH_HOME + '/benchmark_v2/tendermint/src/RawTx'
const DES_ADDRESS = '0x6666666666666666666666666666666666666666'   //The address you want to send money

const ITER = parseInt( process.argv[2] ,10) ; // generate N numbers of txs 
const NONCE = parseInt( process.argv[3] ,10) ; // nonce value

main()

function main(){

    //  Get private key
    console.log('Getting test account privKey');
    let priv_key = getPrivKey( PATH_PRIVKEY );

    //  Generate Raw transactions
    console.log( 'Generate ' , ITER , 'Rawtx' );
    let raw_tx = generateRawTxs( NONCE , priv_key , ITER );

    //  Output RawTx to [output_dir]
    console.log( 'Write RawTx File' );
    writeRawTx( PATH_RAW_TX , raw_tx);

}


//Read privKey buf from [dir]
function getPrivKey ( _path ){
    let arr;
    let str;
    let privkey = [];
    arr = fs.readFileSync(_path).toString().split("\n");
    // -1是因為切割後陣列最後面會多出一個空位置
    for (let i =0; i < arr.length-1; i++ ){
        const buf = new Buffer.from([0x8c, 0x3d, 0x71, 0x0e, 0xef, 0x05, 0x0e, 0xf3, 0xa1, 0x3d, 0x03, 0x5a, 0xd0, 0x05, 0xd0, 0x9e, 0x9d, 0x6b, 0xc7, 0x57, 0x6a, 0xf3, 0x5a, 0xd2, 0xf1, 0x3f, 0xf9, 0xde, 0xd3, 0x65, 0x29, 0x45]);
        str = arr[i].split(" ");
        for(let j =0; j < buf.length; j++){
            buf[j] = str[j+1];
            //+1 因為_path裡面array第一個值是序列
        }

        privkey[i] = buf;
    }

    return privkey;
}


function generateRawTxs ( _nonce , _privateKey , _iter ) {

    let raw_tx_list = [];
    let privkey_list_length = _privateKey.length ;

    for ( var i = 0 ; i < _iter ; i++ ){
        //define transaction para
        let tx_params = {
            nonce: _nonce + parseInt(i/privkey_list_length), // add nonce value to avoid generate same transaction
            to: DES_ADDRESS,
            gasLimit: '0x30000',
            value: '0x01'
        };
        // build transaction
        let transaction = new ethTx(tx_params);
        // sign transaction
        transaction.sign(_privateKey[i%privkey_list_length]);
        let raw_tx = '0x' + transaction.serialize().toString('hex');
        raw_tx_list[i] = raw_tx;
    }
    return raw_tx_list;
}


function writeRawTx( _path , _array) { 

    for (let i = 0 ; i < _array.length ; i ++){

        // if first write over-write file
        if(i == 0){

            fs.writeFileSync( _path , _array[i] + "\n" , function (err) {
                if (err)
                    console.log(err);
            });

        }

        // else : append file
        else{

            fs.appendFileSync( _path , _array[i] + "\n" , function (err) {
                if (err)
                    console.log(err);
                else
                    console.log('Write operation complete.');
            });
        }
    }

}