//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/NFT.sol";
import "./DeployHelpers.s.sol";

contract DeployNFT is ScaffoldETHDeploy {
  // use `deployer` from `ScaffoldETHDeploy`
  function run() external ScaffoldEthDeployerRunner {
    NFT nftContract = new NFT("My NFT", "MNFT");
    console.logString(
      string.concat(
        "NFT contract deployed at: ", vm.toString(address(nftContract))
      )
    );
  }
}
