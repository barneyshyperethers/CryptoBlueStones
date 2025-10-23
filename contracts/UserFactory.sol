// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./UserProfile.sol";

/**
 * @title UserFactory
 * @dev Factory contract for creating user profiles with registration fees
 * @notice Users pay a registration fee to create their own profile contract
 * @dev Uses OpenZeppelin Ownable, ReentrancyGuard, and Pausable for enhanced security
 */
contract UserFactory is Ownable, ReentrancyGuard, Pausable {
    using Address for address payable;
    using SafeERC20 for IERC20;
    
    // State variables
    uint256 public registrationFee;
    mapping(address => address) public userProfiles;
    mapping(string => bool) public usernames;
    
    // New mapping for easy frontend listing
    mapping(uint256 => address) public userProfilesByIndex;
    uint256 public userCount;
    
    // Events
    event UserRegistered(address indexed user, address indexed profile, string username);
    event RegistrationFeeUpdated(uint256 oldFee, uint256 newFee);
    event ETHWithdrawn(address indexed to, uint256 amount);
    event ERC20Withdrawn(address indexed token, address indexed to, uint256 amount);
    event NFTWithdrawn(address indexed nftContract, uint256 indexed tokenId, address indexed to);
    
    modifier validUsername(string memory _username) {
        require(bytes(_username).length > 0, "UserFactory: Username cannot be empty");
        require(bytes(_username).length <= 32, "UserFactory: Username too long");
        require(!usernames[_username], "UserFactory: Username already taken");
        _;
    }
    
    /**
     * @dev Constructor sets the initial registration fee and owner
     * @param _registrationFee The fee in wei required for registration (e.g., 0.01 ETH)
     */
    constructor(uint256 _registrationFee) {
        require(_registrationFee > 0, "UserFactory: Registration fee must be greater than 0");
        
        registrationFee = _registrationFee;
    }
    
    /**
     * @dev Allows users to register by paying the registration fee
     * @param _username The desired username for the profile
     * @return profileAddress The address of the created profile contract
     */
    function registerUser(string memory _username) 
        external 
        payable 
        whenNotPaused
        nonReentrant
        validUsername(_username)
        returns (address profileAddress) 
    {
        require(msg.value >= registrationFee, "UserFactory: Insufficient registration fee");
        require(userProfiles[msg.sender] == address(0), "UserFactory: User already registered");
        
        // Mark username as taken
        usernames[_username] = true;
        
        // Create new UserProfile contract
        UserProfile newProfile = new UserProfile(msg.sender, _username);
        profileAddress = address(newProfile);
        
        // Store the profile address
        userProfiles[msg.sender] = profileAddress;
        
        // Add to indexed mapping for easy frontend listing
        userProfilesByIndex[userCount] = profileAddress;
        userCount++;
        
        // Refund excess payment if any
        if (msg.value > registrationFee) {
            uint256 refundAmount = msg.value - registrationFee;
            payable(msg.sender).sendValue(refundAmount);
        }
        
        emit UserRegistered(msg.sender, profileAddress, _username);
        
        return profileAddress;
    }
    
    /**
     * @dev Allows the owner to update the registration fee
     * @param _newFee The new registration fee in wei
     */
    function updateRegistrationFee(uint256 _newFee) external onlyOwner {
        require(_newFee > 0, "UserFactory: Registration fee must be greater than 0");
        
        uint256 oldFee = registrationFee;
        registrationFee = _newFee;
        
        emit RegistrationFeeUpdated(oldFee, _newFee);
    }
    
    /**
     * @dev Withdraw ETH balance to specified address
     * @param to The address to receive the ETH
     * @param amount The amount of ETH to withdraw (0 = withdraw all)
     */
    function withdrawETH(address payable to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "UserFactory: Cannot withdraw to zero address");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "UserFactory: No ETH balance to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "UserFactory: Insufficient ETH balance");
        require(withdrawAmount > 0, "UserFactory: Withdraw amount must be greater than 0");
        
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
        require(token != address(0), "UserFactory: Invalid token address");
        require(to != address(0), "UserFactory: Cannot withdraw to zero address");
        
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "UserFactory: No token balance to withdraw");
        
        uint256 withdrawAmount = amount == 0 ? balance : amount;
        require(withdrawAmount <= balance, "UserFactory: Insufficient token balance");
        require(withdrawAmount > 0, "UserFactory: Withdraw amount must be greater than 0");
        
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
        require(nftContract != address(0), "UserFactory: Invalid NFT contract address");
        require(to != address(0), "UserFactory: Cannot withdraw to zero address");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == address(this), "UserFactory: Contract does not own this NFT");
        
        nft.safeTransferFrom(address(this), to, tokenId);
        
        emit NFTWithdrawn(nftContract, tokenId, to);
    }
    
    /**
     * @dev Pause the contract to prevent new registrations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract to allow new registrations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Returns the profile address for a given user
     * @param _user The address of the user
     * @return The address of the user's profile contract, or zero address if not registered
     */
    function getUserProfile(address _user) external view returns (address) {
        return userProfiles[_user];
    }
    
    /**
     * @dev Checks if a username is available
     * @param _username The username to check
     * @return True if the username is available, false otherwise
     */
    function isUsernameAvailable(string memory _username) external view returns (bool) {
        return !usernames[_username];
    }
    
    /**
     * @dev Returns the current registration fee
     * @return The registration fee in wei
     */
    function getRegistrationFee() external view returns (uint256) {
        return registrationFee;
    }
    
    /**
     * @dev Returns the factory's current balance
     * @return The balance in wei
     */
    function getFactoryBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Returns the total number of registered users
     * @return The total count of registered users
     */
    function getTotalUserCount() external view returns (uint256) {
        return userCount;
    }
    
    /**
     * @dev Returns a user profile address by index
     * @param _index The index of the user (0-based)
     * @return The address of the user profile contract
     */
    function getUserProfileByIndex(uint256 _index) external view returns (address) {
        require(_index < userCount, "UserFactory: Index out of bounds");
        return userProfilesByIndex[_index];
    }
    
    /**
     * @dev Returns multiple user profile addresses for pagination
     * @param _startIndex Starting index (0-based)
     * @param _count Number of profiles to return
     * @return Array of user profile addresses
     */
    function getUserProfilesBatch(uint256 _startIndex, uint256 _count) external view returns (address[] memory) {
        require(_startIndex < userCount, "UserFactory: Start index out of bounds");
        
        uint256 endIndex = _startIndex + _count;
        if (endIndex > userCount) {
            endIndex = userCount;
        }
        
        address[] memory profiles = new address[](endIndex - _startIndex);
        
        for (uint256 i = _startIndex; i < endIndex; i++) {
            profiles[i - _startIndex] = userProfilesByIndex[i];
        }
        
        return profiles;
    }
}

