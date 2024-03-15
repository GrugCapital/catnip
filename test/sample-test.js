const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("Catnip 🐱🌿 #1", function () {
  it("0.224 cost basis - 420 cats", async function () {
    this.timeout(200000)
    const tubbies = await hre.ethers.getVerifiedContractAt('0xca7ca7bcc765f77339be2d648ba53ce9c8a262bd');
    console.log(await tubbies.totalSupply())

    const Catnip = await ethers.getContractFactory("Catnip");
    const catnip = await Catnip.deploy();
    await catnip.deployed();
    console.log("Deployed catnip")
    await ethers.provider.send("evm_mine", [1645634754]); // force block timestamp to 1 sec past start time
    const mint = await catnip.bulkMint(84, ethers.utils.parseEther("0.62"), {value: ethers.utils.parseEther("94.08")});
    mint.wait()
    console.log("Minting via catnip")
    const receipt = await ethers.provider.getTransactionReceipt(mint.hash)
    const miner = '0xc014ba5ec014ba5ec014ba5ec014ba5ec014ba5e'
    // make sure the catnip contract owns the tubbies
    expect(await tubbies.balanceOf(await catnip.resolvedAddress)).to.equal(420)

    // find out what tubbies we minted, get their id, transfer em out
    var final = []
    receipt.logs.map((log)=> {
      final.push(parseInt(log.topics[3], 16))
    })
    const withdraw = await catnip.withdrawLoot(final)
    withdraw.wait()
    console.log('gas used', receipt.cumulativeGasUsed)
    console.log('gas price', receipt.effectiveGasPrice)

    // make sure the withdraw eoa owns the tubbies
    expect(await tubbies.balanceOf('0x8551C3BB9Bbb8c3809455f6Ead887E304Dd3c2C9')).to.equal(420)
    expect(await tubbies.balanceOf(await catnip.resolvedAddress)).to.equal(0)

    const beforeMiner = await ethers.provider.getBalance(miner, receipt.logs[0].blockNumber - 1)
    const afterMiner = await ethers.provider.getBalance(miner, receipt.logs[0].blockNumber)

    const beforeMinter = await ethers.provider.getBalance(receipt.from, receipt.logs[0].blockNumber - 1)
    const afterMinter = await ethers.provider.getBalance(receipt.from, receipt.logs[0].blockNumber)

    console.log("Miner balance, before/after:")
    console.log('diff', ethers.utils.formatEther(afterMiner.sub(beforeMiner)) , 'ether') // +2 coinbase reward

    console.log("Minter balance, before/after:")
    console.log('diff', ethers.utils.formatEther(afterMinter.sub(beforeMinter)) , 'ether')
    console.log(await tubbies.totalSupply())
  });
});

describe("Catnip 🐱🌿 #2", function () {
  it("Test out bulk mint at 0.250 cost basis - 380 cats", async function () {
    this.timeout(200000)
    const tubbies = await hre.ethers.getVerifiedContractAt('0xca7ca7bcc765f77339be2d648ba53ce9c8a262bd');
    console.log(await tubbies.totalSupply())
  
    const Catnip = await ethers.getContractFactory("Catnip");
    const catnip = await Catnip.deploy();
    await catnip.deployed();
    console.log("Deployed catnip")
    await ethers.provider.send("evm_mine", [1645634754 + 200]); // force block timestamp to 1 sec past start time
    const mint = await catnip.bulkMint(76, ethers.utils.parseEther("0.75"), {value: ethers.utils.parseEther("95")});
    mint.wait()
    console.log("Minting via catnip")
    const receipt = await ethers.provider.getTransactionReceipt(mint.hash)
    const miner = '0xc014ba5ec014ba5ec014ba5ec014ba5ec014ba5e'
    // make sure the catnip contract owns the tubbies
    expect(await tubbies.balanceOf(await catnip.resolvedAddress)).to.equal(380)
    // find out what tubbies we minted, get their id, transfer em out
    var final = []
    receipt.logs.map((log)=> {
      final.push(parseInt(log.topics[3], 16))
    })
    const withdraw = await catnip.withdrawLoot(final)
    withdraw.wait()
    console.log('gas used', receipt.cumulativeGasUsed)
    console.log('gas price', receipt.effectiveGasPrice)
    // make sure the withdraw eoa owns the tubbies
    expect(await tubbies.balanceOf('0x8551C3BB9Bbb8c3809455f6Ead887E304Dd3c2C9')).to.equal(420 + 380)  // carry over 420 from above test
    expect(await tubbies.balanceOf(await catnip.resolvedAddress)).to.equal(0)
  
    const beforeMiner = await ethers.provider.getBalance(miner, receipt.logs[0].blockNumber - 1)
    const afterMiner = await ethers.provider.getBalance(miner, receipt.logs[0].blockNumber)
  
    const beforeMinter = await ethers.provider.getBalance(receipt.from, receipt.logs[0].blockNumber - 1)
    const afterMinter = await ethers.provider.getBalance(receipt.from, receipt.logs[0].blockNumber)
  
    console.log("Miner balance, before/after:")
    console.log('diff', ethers.utils.formatEther(afterMiner.sub(beforeMiner)) , 'ether') // +2 coinbase reward
  
    console.log("Minter balance, before/after:")
    console.log('diff', ethers.utils.formatEther(afterMinter.sub(beforeMinter)) , 'ether')
    console.log(await tubbies.totalSupply())
  });
});

describe("Catnip 🐱🌿 #3", function () {
  it("Test out bulk mint at 0.290 cost basis - 330 cats", async function () {
    this.timeout(200000)
    const tubbies = await hre.ethers.getVerifiedContractAt('0xca7ca7bcc765f77339be2d648ba53ce9c8a262bd');
    console.log(await tubbies.totalSupply())
  
    const Catnip = await ethers.getContractFactory("Catnip");
    const catnip = await Catnip.deploy();
    await catnip.deployed();
    console.log("Deployed catnip")
    await ethers.provider.send("evm_mine", [1645634754 + 400]); // force block timestamp to 1 sec past start time
    const mint = await catnip.bulkMint(66, ethers.utils.parseEther("0.95"), {value: ethers.utils.parseEther("95.7")});
    mint.wait()
    console.log("Minting via catnip")
    const receipt = await ethers.provider.getTransactionReceipt(mint.hash)
    const miner = '0xc014ba5ec014ba5ec014ba5ec014ba5ec014ba5e'
  
    // make sure the catnip contract owns the tubbies
    expect(await tubbies.balanceOf(await catnip.resolvedAddress)).to.equal(330)
  
    // find out what tubbies we minted, get their id, transfer em out
    var final = []
    receipt.logs.map((log)=> {
      final.push(parseInt(log.topics[3], 16))
    })
    const withdraw = await catnip.withdrawLoot(final)
    withdraw.wait()
    console.log('gas used', receipt.cumulativeGasUsed)
    console.log('gas price', receipt.effectiveGasPrice)
  
    // make sure the withdraw eoa owns the tubbies
    expect(await tubbies.balanceOf('0x8551C3BB9Bbb8c3809455f6Ead887E304Dd3c2C9')).to.equal(420 + 380 + 330) // since our eoa has tokens from prev tests
    expect(await tubbies.balanceOf(await catnip.resolvedAddress)).to.equal(0)
  
    const beforeMiner = await ethers.provider.getBalance(miner, receipt.logs[0].blockNumber - 1)
    const afterMiner = await ethers.provider.getBalance(miner, receipt.logs[0].blockNumber)
  
    const beforeMinter = await ethers.provider.getBalance(receipt.from, receipt.logs[0].blockNumber - 1)
    const afterMinter = await ethers.provider.getBalance(receipt.from, receipt.logs[0].blockNumber)
  
    console.log("Miner balance, before/after:")
    console.log('diff', ethers.utils.formatEther(afterMiner.sub(beforeMiner)) , 'ether') // +2 coinbase reward
  
    console.log("Minter balance, before/after:")
    console.log('diff', ethers.utils.formatEther(afterMinter.sub(beforeMinter)) , 'ether')
    console.log(await tubbies.totalSupply())
  });
});