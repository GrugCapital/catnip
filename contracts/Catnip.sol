// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;
interface Tubbies {
    function mintFromSale(uint tubbiesToMint) external payable;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}
contract Catnip {
    Tubbies tc;
    constructor() {
        tc = Tubbies(0xCa7cA7BcC765F77339bE2d648BA53ce9c8a262bD);
    }

    function onERC721Received(address, address, uint256, bytes memory) pure public returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function bulkMint(uint rounds, uint minerBribe) public payable {
        if(block.timestamp>1645634753){
            for(uint i=0; i<rounds;i++){
                // mint 5 at 0.1 ea to the tubby contract
                // pay miner via coinbase transfer for each successful batch mint
                try tc.mintFromSale{value: 0.5 ether}(5){
                    block.coinbase.transfer(minerBribe);
                }catch{
                    emergencyExit();
                    break;
                }
            }
        }else{
            revert("too soon");
        }
    }
    address owner = 0x8551C3BB9Bbb8c3809455f6Ead887E304Dd3c2C9;

    function withdrawLoot(uint[] memory ids) public {
        for(uint i=0;i<ids.length;i++){
            uint id = ids[i];
            tc.safeTransferFrom(address(this), owner, id);
        }
    }
    
    function emergencyExit() public {
        payable(owner).transfer(address(this).balance);
    }
}