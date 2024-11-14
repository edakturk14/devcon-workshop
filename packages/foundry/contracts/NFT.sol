// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NFT is ERC721, ERC721Enumerable {
    uint256 public _nextTokenId;
    uint256 public constant maxSupply = 10; // Set the max supply to 10
    mapping(address => bool) public alreadyMinted; // Keep track

    constructor() ERC721("MyToken", "MTK") {}

    function _baseURI() internal pure override returns (string memory) {
        return
            "https://cdn.britannica.com/33/226533-050-404C15AF/Canary-on-pear-branch.jpg";
    }

    function safeMint(address to) public {
        require(_nextTokenId < maxSupply, "Max supply reached");
        require(!alreadyMinted[to], "Already minted");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
