const StellarSdk = require('stellar-sdk')
const config = require('../../configure.json')
StellarSdk.Network.use(new StellarSdk.Network("stellar"))
server = new StellarSdk.Server(config.stellar.urls[0],{allowHttp: true})

async function createAccount( keypair , amount , operation_count , pub){

    var transaction
    console.log("Create " , operation_count , " Account With" , amount)

    return new Promise((resolve, reject) => { 
      server.loadAccount(keypair.publicKey())
      .then(function(sourceAccount) {
        //console.log(sourceAccount)
        transaction = new StellarSdk.TransactionBuilder(sourceAccount, opts={fee:100})
        return transaction
      })
        .then(function(transaction) {
          for (var i = 0 ; i < operation_count ; i ++){
            transaction = transaction.addOperation(StellarSdk.Operation.createAccount({
              destination: pub[i],
              startingBalance: amount.toString()
            }))
          }
          transaction = transaction.addMemo(StellarSdk.Memo.text('create account'))
          .setTimeout(30)
          .build()
          transaction.sign(keypair)
          return server.submitTransaction(transaction)
        })
        .then(function(result) {
          resolve(result);
        })
        .catch(function(error) {
          console.error('Something went wrong!', error)
          resolve(error)
        })
  
      })
        
}

async function getBalance(pub){
    server.loadAccount(pub).then(function(Account) {
      console.log('Balances for account: ' + pub)
      Account.balances.forEach(function(balance) {
        console.log('Type:', balance.asset_type, ', Balance:', balance.balance)
      });
    });
}

module.exports = {
    createAccount : createAccount,
    getBalance : getBalance
}