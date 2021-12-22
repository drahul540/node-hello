
  // const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
  //   fromWallet.publicKey,
  // );

  // Generate a new wallet keypair and airdrop SOL
  // var fromWallet = web3.Keypair.generate();
  // var fromAirdropSignature = await connection.requestAirdrop(
  //   fromWallet.publicKey,
  //   web3.LAMPORTS_PER_SOL,
  // );
  // // Wait for airdrop confirmation
  // await connection.confirmTransaction(fromAirdropSignature);

  // // Generate a new wallet to receive newly minted token
  // const toWallet = web3.Keypair.generate();

  // // Create new token mint
  // const mint = await splToken.Token.createMint(
  //   connection,
  //   fromWallet,
  //   fromWallet.publicKey,
  //   null,
  //   9,
  //   splToken.TOKEN_PROGRAM_ID,
  // );
  // const frompublickey = 'DPyRf1gv5w4RW3eLnhiEjzZULPAktwmFnCHEM77fTu7E';
  // const fromAccount = await connection.getAccountInfo("DPyRf1gv5w4RW3eLnhiEjzZULPAktwmFnCHEM77fTu7E");
  // Get the token account of the fromWallet Solana address, if it does not exist, create it
  // const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
  //   frompublickey,
  // );
    // console.log(fromAccount);
    // res.end(fromAccount);
  // //get the token account of the toWallet Solana address, if it does not exist, create it
  // const toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
  //   toWallet.publicKey,
  // );

  // // Minting 1 new token to the "fromTokenAccount" account we just returned/created
  // await mint.mintTo(
  //   fromTokenAccount.address,
  //   fromWallet.publicKey,
  //   [],
  //   1000000000,
  // );

  // // Add token transfer instructions to transaction
  // const transaction = new web3.Transaction().add(
  //   splToken.Token.createTransferInstruction(
  //     splToken.TOKEN_PROGRAM_ID,
  //     fromTokenAccount.address,
  //     toTokenAccount.address,
  //     fromWallet.publicKey,
  //     [],
  //     1,
  //   ),
  // );

  // // Sign transaction, broadcast, and confirm
  // const signature = await web3.sendAndConfirmTransaction(
  //   connection,
  //   transaction,
  //   [fromWallet],
  //   {commitment: 'confirmed'},
  // );
  // console.log('SIGNATURE', signature);

  var express = require('express');
  var app = express();
  var fs = require("fs");
  const mysql = require('mysql');
  const web3 = require('@solana/web3.js');
  const splToken = require('@solana/spl-token');
  
  var config = require('./test.json');
console.log(config.firstName + ' ' + config.lastName);