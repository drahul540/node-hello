const http = require('http');
const port = process.env.PORT || 3000;
var i=0;
http.createServer((req, res) => {
  // if (req.originalUrl !== "/favicon.ico") {
  
  if(i==0){
    transferToken();
    console.log("Console success");
    
    // if(i==0){
    i = 1;
    //}
  }
    //
    if(i>0){
      i = 0;
    }
    res.end("SUCCESS");

  // }
  
  
  // res.statusCode = 200;
 

  // const msg = 'Hello Node!\n'
  
  // process.end();
}).listen(port);

// server.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}/`);
// });

const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

const transferToken = async () => {
  
  console.log("In function");
  // Connect to cluster
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );
  // let account = await connection.getAccountInfo("F7coYLLSJUCLgA7ZdHJKHnXCzhTrSDCvPrFcEa7rYPjQ");
  const DEMO_WALLET_SECRET_KEY = new Uint8Array([37,3,2,38,206,216,117,216,90,38,225,170,1,111,113,184,21,185,0,183,42,218,82,223,211,178,148,64,178,219,136,92,184,46,210,43,49,224,108,243,70,9,103,210,90,243,53,82,226,172,140,4,29,125,221,93,72,205,207,177,24,51,127,105]);
  // var recieverWallet = new web3.PublicKey("F7coYLLSJUCLgA7ZdHJKHnXCzhTrSDCvPrFcEa7rYPjQ");
  var fromWallet = web3.Keypair.fromSecretKey(DEMO_WALLET_SECRET_KEY);
  // var toWallet = web3.Keypair.generate();
  
  //var toWalletPK = "F7coYLLSJUCLgA7ZdHJKHnXCzhTrSDCvPrFcEa7rYPjQ";
  //F92dvSxjLvnTcApUjLRbdj7NHsHFhMMeryPFEM2ppGbC
  var toWallet = new web3.PublicKey("F92dvSxjLvnTcApUjLRbdj7NHsHFhMMeryPFEM2ppGbC");
 // var toWallet = new web3.AccountMeta(true,false,toWalletPK);
  var myMint = new web3.PublicKey("FtuzPJYErhtZnqAo5Q34QEAtvr3YBdhoYHwE1fM9hFue");
  var myToken = new splToken.Token(
    connection,
    myMint,
    splToken.TOKEN_PROGRAM_ID,
    fromWallet
  );

  // Create associated token accounts for my token if they don't exist yet
  var fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
  );
  var toTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
    toWallet
  );
  var transaction = new web3.Transaction()
    .add(
      splToken.Token.createTransferInstruction(
        splToken.TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        [],
        web3.LAMPORTS_PER_SOL * 8
      )
    );

  // Sign transaction, broadcast, and confirm
  var signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet]
  );
  console.log("SIGNATURE", signature);

  //return "SUCCESS";
  //process.exit(1);
};