const ethers = require('ethers')
const abi = require('./abi/goCatnip.json')
const goerliRPC = 'https://goerli.infura.io/v3/10ad2e6f1e49425981d6364ba3e54a6e'
const gProvider = new ethers.providers.JsonRpcProvider(goerliRPC)

const testWalletAddr = '0x4bE25c8df13d15E08BffB05789E3a1Fc02b0a820'
const testWalletPk = '1e18c49168445b1693828bf0c76e417f5ad767e7c8cb4fba1efcb327896170b6'
const testWallet = new ethers.Wallet(testWalletPk, gProvider)

const contract = '0x064096356d11a65987384d8de06828a962f70991'

const instance = new ethers.Contract(contract, abi, gProvider);
const signedContract = instance.connect(testWallet)
const txs = [
    '0x729a191c56fd5b240cefb4f2c7f42e43944f28775010ee23a82af5ac12d60b19',
    '0x96659d62e9bcc0281fd96a26512c94e83ef7a106d65aa5c2e1ffa9dd5b33a7b9',
    '0x495497aea03260b804c2496b5ef1eeff7beb67cd855bfce3a22e37a35e7d0149'
]


const main = async () => {
    var final = []
    for(var i=0;i<txs.length;i++){
        const tx = txs[i]
        const receipt = await gProvider.getTransactionReceipt(tx)
        receipt.logs.map((log)=> {
            if(log.topics[0] == '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'){
                final.push(parseInt(log.topics[3], 16))
            }
        })
    }
    console.log(final)

    const res = await signedContract.withdrawLoot(final)
    console.log(res)
}

main()