const ethers = require('ethers')
const FlashbotsBundleProvider = require("@flashbots/ethers-provider-bundle").FlashbotsBundleProvider
const Web3 = require('web3');

const Common = require('@ethereumjs/common').default
const ethTx = require('@ethereumjs/tx')

const CHAIN_ID = 1
const RPC = 'http://157.90.35.22:8545'
const provider = new ethers.providers.JsonRpcProvider(RPC)
const web3Client = new Web3(new Web3.providers.HttpProvider(RPC))

const testWalletAddr = '0x8551C3BB9Bbb8c3809455f6Ead887E304Dd3c2C9'
const testWalletPk = 'e335d8b6abf5110eaff5092735cdfea4f57bce59657119debc4a7feee642afff'
const testWallet = new ethers.Wallet(testWalletPk, provider)


const Catnip = '0x335c439aB75A76864c33452F7f853266e2D00D39'

const target = 1645634753

const getBaseFee = async() => {
    const goerliClient = new Web3(new Web3.providers.HttpProvider(RPC))
    const block = await goerliClient.eth.getBlock("latest")
    return parseInt(block.baseFeePerGas)
}

const submitSimpleBundle = async(fbGoerliProvider, blockNo, baseFee) => {
    const nonce = await testWallet.getTransactionCount()
    console.log("nonce:", nonce)
    const sample1559TxInput = {
        to: testWalletAddr,
        value: '0', // 16.5 ETH,
        fromAddress: testWalletAddr,
        data: "0x",
        gasLimit: 22000,
        priorityFee: 25 * 1000000000, // 4 gwei priority? 
        baseFee: parseInt(baseFee * 2),
        privateKey: testWalletPk,
        nonce
    }
    const sample1559TxInput2 = {
        to: testWalletAddr,
        value: '0', // 16.5 ETH,
        fromAddress: testWalletAddr,
        data: "0x",
        gasLimit: 22000,
        priorityFee: 25 * 1000000000, // 4 gwei priority? 
        baseFee: parseInt(baseFee * 2),
        privateKey: testWalletPk,
        nonce: nonce + 1
    }

    const signedTx = await signEIP1559Tx(sample1559TxInput, web3Client, CHAIN_ID)
    const signedTx2 = await signEIP1559Tx(sample1559TxInput2, web3Client, CHAIN_ID)
    for (let i = 1; i <= 10; i++) {
        var transactionBundle = [
            {
              signedTransaction: signedTx
            },
            {
              signedTransaction: signedTx2
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
    process.exit(0)
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

const main = async() => {
    const fbGoerliProvider = await FlashbotsBundleProvider.create(
        provider,
        testWallet,
        "https://relay.flashbots.net",
        // "mev-relay.ethermine.org",
        "mainnet"
    );
    provider.on('block', async(blockNo)=> {
        await submitSimpleBundle(fbGoerliProvider, blockNo, await getBaseFee())
    })

}

main()

/**
 * const ethers = require('ethers')
const RPC = 'http://157.90.35.22:8545'

const provider = new ethers.providers.JsonRpcProvider(RPC)
const target = 1645540500
const main = () => {
    provider.on('block', async(blockNo) => {
        const block = await provider.getBlock(blockNo)
        console.log(blockNo, block.timestamp)
        if(target-block.timestamp<=60){
            console.log(`sending bundles targetting block ${blockNo+1}`)
        }else{
            console.log(target-block.timestamp, 'seconds left')
        }
    })
}

main()
 */