const ethers = require('ethers')
const chalk = require('chalk')
const abi = require('./abi/tubby.json')
const RPC = 'http://157.90.35.22:8545'
const provider = new ethers.providers.JsonRpcProvider(RPC)

const contract = '0xCa7cA7BcC765F77339bE2d648BA53ce9c8a262bD'
const instance = new ethers.Contract(contract, abi, provider);
const catnip = '0x335c439aB75A76864c33452F7f853266e2D00D39'

const main = async () => {
    provider.on('block', async(blockNo) => {
        console.log(chalk.blue("At block:", blockNo))
        const supply = parseInt((await instance.totalSupply()).toString())
        console.log(chalk.white("Minted so far:", supply))
        console.log(chalk.red("Supply left:", 20000 - supply))
        const balance = await instance.balanceOf(catnip)
        console.log(chalk.green("Owned by us:", balance.toString()))
        console.log("--------------------------------")

    })
}

main()