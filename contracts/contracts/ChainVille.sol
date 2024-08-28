// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // added

contract ChainVille is ERC721, Ownable {
    uint256 private _nextTokenId;
    IERC20 public gameToken; // added
    uint256 public districtPrice; // added

    struct District {
        uint256 x;
        uint256 y;
        string metadata_url;
        string district_name; // added
        bytes32 stateHash;
        uint256 lastUpdate;
    }

    mapping(uint256 => District) private _districts;
    mapping(uint256 => mapping(uint256 => uint256)) private _coordinateToTokenId;
    mapping(address => uint256[]) private _ownedDistricts;
    mapping(uint256 => uint256) private _districtVersion; // added
    mapping(uint256 => mapping(string => uint256)) private _districtResources; // added

    event DistrictAcquired(address indexed owner, uint256 indexed tokenId, uint256 x, uint256 y, string metadata_url, string district_name);
    event DistrictStateUpdated(uint256 indexed tokenId, string metadata_url, bytes32 stateHash, uint256 timestamp);
    event InfrastructureBuilt(uint256 indexed tokenId, string infrastructureType); // Added
    event Withdrawal(address indexed owner, uint256 amount);

    constructor(address initialOwner, address tokenAddress, uint256 _districtPrice) ERC721("ChainVille", "CV") Ownable(initialOwner) {
        _nextTokenId = 0;
        gameToken = IERC20(tokenAddress); // added
        districtPrice = _districtPrice; // added
    }

    // Added
    function buildInfrastructure(uint256 tokenId, string memory infrastructureType) public {
        require(_isAuthorized(msg.sender, tokenId), "Not owner nor approved");

        // Assuming each infrastructure requires 100 units of a certain resource
        require(_districtResources[tokenId]["basic_resource"] >=100, "Insufficient Resources");

        _districtResources[tokenId]["basic_resource"] -= 100;
        
        emit InfrastructureBuilt(tokenId, infrastructureType);
    }

    function acquireDistrict(uint256 x, uint256 y, string memory metadata_url, string memory district_name) public {
        require(_coordinateToTokenId[x][y] == 0, "District already acquired");
        require(gameToken.transferFrom(msg.sender, address(this), districtPrice), "Payment Failed"); // added
        
        uint256 newTokenId = _nextTokenId++;
        _safeMint(msg.sender, newTokenId);
        
        _districts[newTokenId] = District(x, y, metadata_url, district_name, bytes32(0), 0);
        _coordinateToTokenId[x][y] = newTokenId;
        _ownedDistricts[msg.sender].push(newTokenId);
        
        emit DistrictAcquired(msg.sender, newTokenId, x, y, metadata_url, district_name);
    } 

    // edited
    function updateDistrictState(uint256 tokenId, string memory metadata_url, bytes32 stateHash) public {
        require(_isAuthorized(msg.sender, tokenId), "Not owner nor approved");
        District storage district = _districts[tokenId];
        _districtVersion[tokenId]++;

        district.metadata_url = metadata_url;
        district.stateHash = stateHash;
        district.lastUpdate = block.timestamp;
        
        emit DistrictStateUpdated(tokenId, metadata_url, stateHash, block.timestamp);
    }

    // Added
    // Allows querying the current version of the district
    function getDistrictVersion(uint256 tokenId) public view returns (uint256) {
        return _districtVersion[tokenId];
    }

    function getDistrictDetails(uint256 tokenId) public view returns (uint256 x, uint256 y, string memory metadata_url, string memory district_name, bytes32 stateHash, uint256 lastUpdate) {
        require(_ownerOf(tokenId) != address(0), "District does not exist");
        District memory district = _districts[tokenId];
        return (district.x, district.y, district.metadata_url, district.district_name, district.stateHash, district.lastUpdate);
    }

    function isDistrictAcquired(uint256 x, uint256 y) public view returns (bool) {
        return _coordinateToTokenId[x][y] != 0;
    }

    function getTokenIdByCoordinates(uint256 x, uint256 y) public view returns (uint256) {
        require(_coordinateToTokenId[x][y] != 0, "District not acquired");
        return _coordinateToTokenId[x][y];
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        if (from != address(0)) {
            _removeTokenFromOwnerList(from, tokenId);
        }
        if (to != address(0)) {
            _ownedDistricts[to].push(tokenId);
        }
        
        return from;
    }

    function getDistrictsByOwner(address owner) public view returns (uint256[] memory) {
        return _ownedDistricts[owner];
    }

    function _removeTokenFromOwnerList(address owner, uint256 tokenId) private {
        uint256[] storage ownerDistricts = _ownedDistricts[owner];
        for (uint i = 0; i < ownerDistricts.length; i++) {
            if (ownerDistricts[i] == tokenId) {
                ownerDistricts[i] = ownerDistricts[ownerDistricts.length - 1];
                ownerDistricts.pop();
                break;
            }
        }
    }

    // added
    function _isAuthorized(address operator, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return operator == owner || getApproved(tokenId) == operator || isApprovedForAll(owner, operator);
    }

    // added
    // owner to update parameters like district prices
    function setDistrictPrice(uint256 newPrice) public onlyOwner {
        districtPrice = newPrice;
    }

    // added
    // allows owner to change the ERC20 token used in the game
    function setTokenAddress(address newTokenAddress) public onlyOwner {
        gameToken = IERC20(newTokenAddress);
    }

    // Allows players to merge two or more districts into a larger, more powerful district
    function mergeDistricts(uint256[] memory tokenIds, string memory newMetadataUrl, string memory newDistrictName) public {
        require(tokenIds.length > 1, "At least two districts required for merging");

        uint256 newTokenId = _nextTokenId++;
        uint256 x = 0;
        uint256 y = 0;

        // Calculate new coordinates (could be based on the average of all district cordinates)
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(_isAuthorized(msg.sender, tokenIds[i]), "Not owned nor approved");
            District memory district = _districts[tokenIds[i]];
            x += district.x;
            y += district.y;

            // Burn old districts
            _burn(tokenIds[i]);
        }

        x /= tokenIds.length;
        y /= tokenIds.length;

        _districts[newTokenId] = District(x, y, newMetadataUrl, newDistrictName, bytes32(0), block.timestamp);
        _safeMint(msg.sender, newTokenId);
        _ownedDistricts[msg.sender].push(newTokenId);

        emit DistrictAcquired(msg.sender, newTokenId, x, y, newMetadataUrl, newDistrictName);
    }

    // added withdraw 
    function withdraw(uint256 amount, bool withdrawToken) public onlyOwner {
        if (withdrawToken) {
            require(gameToken.transfer(msg.sender, amount), "Token withdrawal failed");
        } else {
            payable(owner()).transfer(amount);
        }
        emit Withdrawal(msg.sender, amount);
    }
}
