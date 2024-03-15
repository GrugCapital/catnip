const ethers = require('ethers')
const FlashbotsBundleProvider = require("@flashbots/ethers-provider-bundle").FlashbotsBundleProvider
const Web3 = require('web3');

const Common = require('@ethereumjs/common').default
const ethTx = require('@ethereumjs/tx')

const CHAIN_ID = 5
const goerliRPC = 'https://goerli.infura.io/v3/10ad2e6f1e49425981d6364ba3e54a6e'
const gProvider = new ethers.providers.JsonRpcProvider(goerliRPC)
const web3Client = new Web3(new Web3.providers.HttpProvider(goerliRPC))

const testWalletAddr = '0x4bE25c8df13d15E08BffB05789E3a1Fc02b0a820'
const testWalletPk = '1e18c49168445b1693828bf0c76e417f5ad767e7c8cb4fba1efcb327896170b6'
const testWallet = new ethers.Wallet(testWalletPk, gProvider)


// const flashbotsTransactionResponse = await fbGoerliProvider.sendBundle(
//     transactionBundle,
//     blockNumber + i,
// )

const goerliCatnip = '0x5beeEd8d9398Df4414376cADC75d92dF6770Db59'


const target = 1645540500

// Get base fee
const getBaseFee = async() => {
    const goerliClient = new Web3(new Web3.providers.HttpProvider(goerliRPC))
    const block = await goerliClient.eth.getBlock("latest")
    return parseInt(block.baseFeePerGas)
}

const submitSimpleBundle = async(fbGoerliProvider, blockNo, baseFee) => {
    const nonce = await testWallet.getTransactionCount()
    console.log("nonce:", nonce)
    const sample1559TxInput = {
        to: '0x356Bb9091a02e8349136CA5C331847238b3dEd33',
        value: '16500000000000000000', // 16.5 ETH,
        fromAddress: testWalletAddr,
        data: "0x81433e63000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000b1a2bc2ec50000",
        gasLimit: 28000000,
        priorityFee: 4 * 1000000000, // 3 gwei priority? 
        baseFee,
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
    }
    // const res = await gProvider.sendTransaction(signedTx)
    // console.log(signedTx)
    // console.log(res)

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
        maxPriorityFeePerGas: Web3.utils.toHex(input.priorityFee), // 0 tip for now
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
        gProvider,
        testWallet,
        "https://relay-goerli.flashbots.net",
        "goerli"
    );
    gProvider.on('block', async(blockNo)=> {
        // console.log(blockNo, await getBaseFee())
        await submitSimpleBundle(fbGoerliProvider, blockNo, await getBaseFee())
    })
    // provider.on('block', async(blockNo) => {
    //     const block = await provider.getBlock(blockNo)
    //     console.log(blockNo, block.timestamp)
    //     if(target-block.timestamp<=60){
    //         console.log(`sending bundles targetting block ${blockNo+1}`)
    //     }else{
    //         console.log(target-block.timestamp, 'seconds left')
    //     }
    // })
}

main()



    // const signedTxs = [
    //   // some transaction
    //   await testWallet.signTransaction({
    //     to: "0x0000000000000000000000000000000000000000",
    //     value: ethers.utils.parseEther('0.1'),
    //     nonce: nonce,
    //     chainId: 5,
        

    //   })
    // ]
