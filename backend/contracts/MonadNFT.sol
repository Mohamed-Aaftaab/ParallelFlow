// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonadNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    string private _baseURIString;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseUri
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseURIString = baseUri;
    }

    function _baseURI() override internal view returns (string memory) {
        return _baseURIString;
    }

    function mintItem(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }
}
