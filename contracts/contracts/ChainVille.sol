// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChainVille is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct Land {
        uint256 x;
        uint256 y;
        string metadata_url;
        bytes32 stateHash;
        uint256 lastUpdate;
    }

    mapping(uint256 => Land) private _lands;
    mapping(uint256 => mapping(uint256 => uint256)) private _coordinateToTokenId;
    mapping(address => uint256[]) private _ownedLands;

    event LandAcquired(address indexed owner, uint256 indexed tokenId, uint256 x, uint256 y, string metadata_url);
    event LandStateUpdated(uint256 indexed tokenId, string metadata_url, bytes32 stateHash, uint256 timestamp);

    constructor(address initialOwner) ERC721("ChainVille", "CV") Ownable(initialOwner) {
        _nextTokenId = 0;
    }

    function acquireLand(uint256 x, uint256 y, string memory metadata_url) public {
        require(_coordinateToTokenId[x][y] == 0, "Land already acquired");
        
        uint256 newTokenId = _nextTokenId++;
        _safeMint(msg.sender, newTokenId);
        
        _lands[newTokenId] = Land(x, y, metadata_url, bytes32(0), 0);
        _coordinateToTokenId[x][y] = newTokenId;
        _ownedLands[msg.sender].push(newTokenId);
        
        emit LandAcquired(msg.sender, newTokenId, x, y, metadata_url);
    }

    function updateLandState(uint256 tokenId, string memory metadata_url, bytes32 stateHash) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");
        Land storage land = _lands[tokenId];
        land.metadata_url = metadata_url;
        land.stateHash = stateHash;
        land.lastUpdate = block.timestamp;
        
        emit LandStateUpdated(tokenId, metadata_url, stateHash, block.timestamp);
    }

    function getLandDetails(uint256 tokenId) public view returns (uint256 x, uint256 y, string memory metadata_url, bytes32 stateHash, uint256 lastUpdate) {
        require(_ownerOf(tokenId) != address(0), "Land does not exist");
        Land memory land = _lands[tokenId];
        return (land.x, land.y, land.metadata_url, land.stateHash, land.lastUpdate);
    }

    function isLandAcquired(uint256 x, uint256 y) public view returns (bool) {
        return _coordinateToTokenId[x][y] != 0;
    }

    function getTokenIdByCoordinates(uint256 x, uint256 y) public view returns (uint256) {
        require(_coordinateToTokenId[x][y] != 0, "Land not acquired");
        return _coordinateToTokenId[x][y];
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        if (from != address(0)) {
            _removeTokenFromOwnerList(from, tokenId);
        }
        if (to != address(0)) {
            _ownedLands[to].push(tokenId);
        }
        
        return from;
    }

    function getLandsByOwner(address owner) public view returns (uint256[] memory) {
        return _ownedLands[owner];
    }

    function _removeTokenFromOwnerList(address owner, uint256 tokenId) private {
        uint256[] storage ownerLands = _ownedLands[owner];
        for (uint i = 0; i < ownerLands.length; i++) {
            if (ownerLands[i] == tokenId) {
                ownerLands[i] = ownerLands[ownerLands.length - 1];
                ownerLands.pop();
                break;
            }
        }
    }
}