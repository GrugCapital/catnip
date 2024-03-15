const ethers = require('ethers')
const FlashbotsBundleProvider = require("@flashbots/ethers-provider-bundle").FlashbotsBundleProvider
const Web3 = require('web3');

const Common = require('@ethereumjs/common').default
const ethTx = require('@ethereumjs/tx')

const CHAIN_ID = 1
const RPC = 'http://157.90.35.22:8545'
const provider = new ethers.providers.JsonRpcProvider(RPC)
const web3Client = new Web3(new Web3.providers.HttpProvider(RPC))

// infura
const infuraRPC = 'https://mainnet.infura.io/v3/758f657822f146a08b71d22b29be2437'
const infuraProvider = new ethers.providers.JsonRpcProvider(infuraRPC)

const testWalletAddr = '0x8551C3BB9Bbb8c3809455f6Ead887E304Dd3c2C9'
const testWalletPk = 'e335d8b6abf5110eaff5092735cdfea4f57bce59657119debc4a7feee642afff'
const testWallet = new ethers.Wallet(testWalletPk, provider)


const Catnip = '0x335c439aB75A76864c33452F7f853266e2D00D39'

const abi = require('./abi/tubby.json')

const tubbyAddr = '0xCa7cA7BcC765F77339bE2d648BA53ce9c8a262bD'
const tubbyContract = new ethers.Contract(tubbyAddr, abi, provider);


const target = 1645634753

const getBaseFee = async() => {
    const goerliClient = new Web3(new Web3.providers.HttpProvider(RPC))
    const block = await goerliClient.eth.getBlock("latest")
    return parseInt(block.baseFeePerGas)
}

const submitSimpleBundle = async(fbGoerliProvider, blockNo, baseFee, value, txData, ready) => {
    const nonce = await testWallet.getTransactionCount()
    console.log("nonce:", nonce)
    const sample1559TxInput = {
        to: Catnip,
        value: value, // based on how many ever left ETH,
        // value: '0', // 16.5 ETH,
        fromAddress: testWalletAddr,
        data: txData,
        gasLimit: 25000000, // 25M gas limit
        priorityFee: 25 * 1000000000, // 25 gwei priority? 
        baseFee: parseInt(baseFee * 2), // to leave room for base fee expansion in subsequent blocks
        privateKey: testWalletPk,
        nonce
    }

    const signedTx = await signEIP1559Tx(sample1559TxInput, web3Client, CHAIN_ID)
    for (let i = 1; i <= 10; i++) {
        var transactionBundle = [
            {
              signedTransaction: signedTx
            }
        ]
        console.log('bundle', i)
        console.log('targetting block:', blockNo + i)
        console.log(transactionBundle)
        const flashbotsTransactionResponse = await fbGoerliProvider.sendBundle(
            transactionBundle,
            blockNo + i,
        )
        console.log(`Sent bundle for block #${blockNo + i}, res: `, flashbotsTransactionResponse )

        console.log("Basefee: ", baseFee)
        console.log("Max: ", Web3.utils.toHex(sample1559TxInput.baseFee + sample1559TxInput.priorityFee))
    }
    console.log("is ready?", ready)
    if(ready){ // if it's live, submit tx to mempool too
       const res =  await infuraProvider.send('eth_sendRawTransaction', [signedTx])
       console.log(res)
    }
}

const signEIP1559Tx = async (input, client, chainID) => {
    const accountNonce = await client.eth.getTransactionCount(input.fromAddress);
    const tx = {
        to: input.to,
        data: input.data,
        value: Web3.utils.toHex(input.value),
        nonce: Web3.utils.toHex(input.nonce) || Web3.utils.toHex(accountNonce),
        gasLimit: Web3.utils.toHex(input.gasLimit),
        maxFeePerGas: Web3.utils.toHex(input.baseFee + input.priorityFee),
        maxPriorityFeePerGas: Web3.utils.toHex(input.priorityFee),
        chainId: chainID,
        accessList: [],
        type: "0x02" // ensures the tx isn't legacy type
    }
    console.log(tx)
    // custom common for our private network
    const customCommon = Common.forCustomChain(
        'mainnet',
        {
            name: 'mev-geth-with-1559',
            chainId: chainID,
        },
        'london',
    );
    // sign and return
    const unsignedTx = new ethTx.FeeMarketEIP1559Transaction(tx, {customCommon});
    const signedTx = unsignedTx.sign(Buffer.from(input.privateKey, 'hex'))
    return '0x' + signedTx.serialize().toString('hex');
}


const init = async() => {
    const fbGoerliProvider = await FlashbotsBundleProvider.create(
        provider,
        testWallet,
        "https://relay.flashbots.net",
        "mainnet"
    );
    
    provider.on('block', async(blockNo) => {
        const block = await provider.getBlock(blockNo)
        console.log("At block# ", blockNo);
        console.log("Current timestamp: ", block.timestamp)
        const timeLeft = target-block.timestamp
        const supply = parseInt((await tubbyContract.totalSupply()).toString())
        const remaining = 20000-supply
        console.log("Remaining cats: ", remaining)
        if(timeLeft<=120){
            // console.log(`sending bundles targetting block ${blockNo+1}`)
            if(remaining>2500){ // if theres a lot left, bid higher
                // choose 0.24 eth per nft
                console.log("Still a lot left")
                var value = '93600000000000000000' //93.6 eth for the whole thing
                var txData = '0x81433e630000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000094c51733f830000'
                var ready = false
                if(timeLeft<=15){
                    ready = true
                }
                await submitSimpleBundle(
                    fbGoerliProvider, blockNo, await getBaseFee(), value, txData, ready
                )

            }else {
                var value = '96250000000000000000' //96.25 eth for the whole thing
                var txData = '0x81433e6300000000000000000000000000000000000000000000000000000000000000460000000000000000000000000000000000000000000000000c249fdd32778000'
                // bid higher, 0.275 eth per nft?
                var ready = false
                if(timeLeft<=15){
                    ready = true
                }
                await submitSimpleBundle(
                    fbGoerliProvider, blockNo, await getBaseFee(), value, txData, ready
                )

            }
        }else{
            console.log(target-block.timestamp, 'seconds left to mint')
        }
    })
}

init()
