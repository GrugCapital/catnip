Scripts and contracts for executing a batch mint of the TubbyCats NFT 

1. The Tubbies interface is defined, which declares two external functions: mintFromSale and safeTransferFrom. 

2. The Catnip contract is defined, with a variable tc of type Tubbies. The tc variable within the constructor is assigned an instance of the Tubbies contract at the specified Ethereum address.

3. The onERC721Received function is an implementation of the ERC721Receiver interface. It returns the function selector, which allows the contract to receive ERC721 tokens (NFTs).

4. The bulkMint function takes in two arguments, rounds and minerBribe and performs the following:
  a. Checks if the current timestamp is greater than 1645634753 (Unix time), if not, it reverts with the message "too soon."
  b. If the timestamp condition is met, it loops for the specified number of rounds and tries to mint 5 Tubbies each time.
  c. If the minting is successful, it transfers minerBribe amount of Ether to the miner (block.coinbase) as an incentive for including the transaction.
  d. If the minting fails, the function calls emergencyExit() and breaks the loop.

5. The owner variable is initialized with a hardcoded Ethereum address.

6. The withdrawLoot function takes an array of ids and loops through them to transfer each corresponding Tubbies token from the Catnip contract to the owner using the safeTransferFrom function.

7. The emergencyExit function allows transferring the entire balance of the Catnip contract to the owner.

In total this opportunity profited nearly half a million dollars and was replicated across a number of different NFT drops, illustrating that following the KISS principle often leads to outsized returns. 
