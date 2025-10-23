// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title UserProfile
 * @dev Individual user profile contract created by UserFactory
 * @notice Each user gets their own profile contract with unique username
 * @dev Uses OpenZeppelin Ownable and ReentrancyGuard for enhanced security
 */
contract UserProfile is Ownable, ReentrancyGuard {
    using Address for address payable;
    using SafeERC20 for IERC20;
    
    // State variables
    string public username;
    address public immutable factory;
    
    // Events
    event UsernameUpdated(address indexed user, string oldUsername, string newUsername);
    event ETHWithdrawn(address indexed to, uint256 amount);
    event ERC20Withdrawn(address indexed token, address indexed to, uint256 amount);
    event NFTWithdrawn(address indexed nftContract, uint256 indexed tokenId, address indexed to);
    
    modifier onlyFactory() {
        require(msg.sender == factory, "UserProfile: Only factory can create profiles");
        _;
    }
    
    /**
     * @dev Constructor that can only be called by the UserFactory
     * @param _owner The address of the user who owns this profile
     * @param _username The username for this profile
     */
    constructor(address _owner, string memory _username) {
        require(_owner != address(0), "UserProfile: Owner cannot be zero address");
        require(bytes(_username).length > 0, "UserProfile: Username cannot be empty");
        
        _transferOwnership(_owner);
        username = _username;
        factory = msg.sender;
    }
    
    /**
     * @dev Allows the owner to update their username
     * @param _newUsername The new username
     */
    function updateUsername(string memory _newUsername) external onlyOwner nonReentrant {
        require(bytes(_newUsername).length > 0, "UserProfile: Username cannot be empty");
        
        string memory oldUsername = username;
        username = _newUsername;
        
        emit UsernameUpdated(owner(), oldUsername, _newUsername);
    }
    
    /**
     * @dev Returns the profile information
     * @return _owner The owner address
     * @return _username The current username
     * @return _factory The factory address that created this profile
     */
    function getProfileInfo() external view returns (
        address _owner,
        string memory _username,
        address _factory
    ) {
        return (owner(), username, factory);
    }
    
    /**
     * @dev Withdraw ETH balance to specified address
     * @param to The address to receive the ETH
     * @param amount The amount of ETH to withdraw (0 = withdraw all)
     */
    function withdrawETH(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "UserProfile: Cannot withdraw to zero address");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "UserProfile: No ETH balance to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "UserProfile: Insufficient ETH balance");
        require(withdrawAmount > 0, "UserProfile: Withdraw amount must be greater than 0");
        
        to.sendValue(withdrawAmount);
        
        emit ETHWithdrawn(to, withdrawAmount);
    }
    
    /**
     * @dev Withdraw ERC20 tokens to specified address
     * @param token The ERC20 token contract address
     * @param to The address to receive the tokens
     * @param amount The amount of tokens to withdraw (0 = withdraw all)
     */
    function withdrawERC20(address token, address to, uint256 amount) external onlyOwner nonReentrant {
        require(token != address(0), "UserProfile: Invalid token address");
        require(to != address(0), "UserProfile: Cannot withdraw to zero address");
        
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "UserProfile: No token balance to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "UserProfile: Insufficient token balance");
        require(withdrawAmount > 0, "UserProfile: Withdraw amount must be greater than 0");
        
        tokenContract.safeTransfer(to, withdrawAmount);
        
        emit ERC20Withdrawn(token, to, withdrawAmount);
    }
    
    /**
     * @dev Withdraw ERC721 NFT to specified address
     * @param nftContract The ERC721 NFT contract address
     * @param tokenId The token ID to withdraw
     * @param to The address to receive the NFT
     */
    function withdrawNFT(address nftContract, uint256 tokenId, address to) external onlyOwner nonReentrant {
        require(nftContract != address(0), "UserProfile: Invalid NFT contract address");
        require(to != address(0), "UserProfile: Cannot withdraw to zero address");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == address(this), "UserProfile: Contract does not own this NFT");
        
        nft.safeTransferFrom(address(this), to, tokenId);
        
        emit NFTWithdrawn(nftContract, tokenId, to);
    }
}

