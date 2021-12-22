const fs = require("fs");
const https = require("https");
const { PublicKey } = require("@solana/web3.js");

const RPC_URL = "https://ssc-dao.genesysgo.net/";
async function fetch(url, options = {}){
	return new Promise((resolve, reject) => {
		let req = https.request(url, options, res => {
			let data = [];
			res.on("data", d => data.push(d));
			res.on("end", e => {
				let rawData = Buffer.concat(data).toString();
				resolve({
					headers: res.headers,
					status: res.statusCode,
					url,
					text: async () => rawData,
					json: async () => JSON.parse(rawData)
				})
			});
		});

		req.on("error", reject);

		let body = options.body;
		if(typeof body != "string")
			body = JSON.stringify(body);
		if(body && options.method != "GET" && options.method != "HEAD")
			req.write(body);
		
		req.end();
	});
}

async function rpcCall(method, params){
	let response = await fetch(RPC_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			id: "0",
			jsonrpc: "2.0",
			method,
			params
		})
	});
	let json = await response.json();
	
	if(Math.floor(response.status/100) != 2)
		throw new Error(JSON.stringify(json.error, null, 4));
	
	return json.result;
}

async function getCandyMachineMints(candyMachineAddress){
	let response = await rpcCall(
		"getProgramAccounts",
		[
			"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
			{
				encoding: "base64",
				dataSlice: { offset: 33, length: 32 },
				filters: [
					{
						memcmp: {
							offset: 326,
							bytes: candyMachineAddress
						}
					}
				]
			}
		]
	);
	
	return response.map(
		({account: {data}}) => new PublicKey(Buffer.from(data[0], "base64")).toBase58()
	);
}

async function getFirstOwner(mintAddress){
	// filter all mintTo instructions
	// then find the one that mints ${mintAddress}
	
	let transactionHistory = await getTransactionHistory(mintAddress);
	let firstTransaction = transactionHistory[transactionHistory.length - 1];
	
	let {
		transaction: { message: { accountKeys } },
		meta: { preBalances, postBalances }
	} = await getTransaction(firstTransaction.signature);
	for(let i = 0; i < accountKeys.length; i++)
		if((postBalances[i] - preBalances[i]) < 0)
			return accountKeys[i];
	
	throw new Error(`Could not get first owner for ${mintAddress}`);
}

async function getCurrentOwner(mintAddress){
	let tokenAccounts = await getTokenLargestAccounts(mintAddress);
	
	let ownerTokenAccount = null;
	for(let account of tokenAccounts)
		if(account.amount == "1")
			ownerTokenAccount = account.address;
	
	if(!ownerTokenAccount)
		throw new Error(`Could not get current owner for ${mintAddress}`);
	
	let ownerTokenAccountInfo = await getAccountInfo(ownerTokenAccount);
	return ownerTokenAccountInfo.info.owner;
}

async function getTransactionHistory(mintAddress){
	return rpcCall("getSignaturesForAddress", [mintAddress]);
}

async function getTransaction(transactionId){
	return rpcCall("getTransaction", [transactionId]);
}

async function getAccountInfo(address){
	return rpcCall("getAccountInfo", [address, { encoding: "jsonParsed" }])
		.then(e => e.value.data.parsed);
}

async function getTokenLargestAccounts(token){
	return rpcCall("getTokenLargestAccounts", [token])
		.then(e => e.value);
}

async function main(){
	
console.log("Hello Multiple");
	const batchSize = 50;
	const maxRetries = 10;
	const outputFile = "originalOwners.json";

	const marketplaceAddresses = {
		"MagicEden": "GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp"
	};

	const candyMachines = [
		"4fXvqoS7PUxNopDKCg9fjPAf3kAWMuAWfzys92tptphR",
		"HD2fSmFWsGtY2j27FHhCjS21ubMbLVrmsRbrJ85ENTjb"
	];

	let addresses = [];
	for(let candyMachine of candyMachines)
		addresses = addresses.concat(await getCandyMachineMints(candyMachine));
	
	// also use an array of RPC requests to further optimize
	let owners = [];
	let retryCount = 0;
	for(let i = 0; i < addresses.length;){
		let batch = [];
		for(let j = 0; j < batchSize && i < addresses.length; i++, j++)
			batch.push(getCurrentOwner(addresses[i]));
		console.warn(`Running: ${i - batch.length} to ${i}`);
		try{
			owners = owners.concat(await Promise.all(batch));
			retryCount = 0;
		}
		catch(e){
			console.warn(`Failed: ${e.message}`);
			if(retryCount < maxRetries){
				console.warn(`Running: ${i - batch.length} to ${i}`);
				i -= batch.length;
				retryCount++;
			}
			else{
				console.error("Max retry count exceeded, exiting");
				break;
			}
		}
	}
	
	console.log(`Writing list to ${outputFile}`)
	// await fs.promises.writeFile(outputFile, JSON.stringify(owners));
	
	let ownerCount = {};
	for(let owner of owners){
		if(!(owner in ownerCount))
			ownerCount[owner] = 0;
		ownerCount[owner]++;
	}
	
	let eligibleHolders = addresses.length;
	for(let [name, address] of Object.entries(marketplaceAddresses)){
		let listedCount = ownerCount[address];
		delete ownerCount[address];
		eligibleHolders -= listedCount;
		console.warn(`Skipping ${listedCount} tokens listed on ${name} (${address})`);
	}
	
	// await fs.promises.writeFile("ownerCount.json", JSON.stringify(ownerCount, null, 4));
	
	let distributionAmount = parseFloat(process.argv[2]);
	const AMOUNT_PER_TOKEN = distributionAmount/eligibleHolders;
	console.warn(`Distributing ${distributionAmount} to ${eligibleHolders} = ${AMOUNT_PER_TOKEN}/holder`);
	for(let [owner, count] of Object.entries(ownerCount))
		console.log(`solana transfer ${owner} ${count * AMOUNT_PER_TOKEN} --allow-unfunded-recipient`);
}

if(require.main)
	main().catch(console.error);