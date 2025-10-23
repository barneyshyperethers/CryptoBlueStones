// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserProfile.sol";

/**
 * @title UserFactory
 * @dev Factory contract for creating user profiles with registration fees
 * @notice Users pay a registration fee to create their own profile contract
 */
contract UserFactory {
    // State variables
    uint256 public registrationFee;
    address public owner;
    mapping(address => address) public userProfiles;
    mapping(string => bool) public usernames;
    
    // Events
    event UserRegistered(address indexed user, address indexed profile, string username);
    event RegistrationFeeUpdated(uint256 oldFee, uint256 newFee);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "UserFactory: Only owner can call this function");
        _;
    }
    
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
        owner = msg.sender;
    }
    
    /**
     * @dev Allows users to register by paying the registration fee
     * @param _username The desired username for the profile
     * @return profileAddress The address of the created profile contract
     */
    function registerUser(string memory _username) 
        external 
        payable 
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
        
        // Refund excess payment if any
        if (msg.value > registrationFee) {
            payable(msg.sender).transfer(msg.value - registrationFee);
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
     * @dev Allows the owner to withdraw collected fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "UserFactory: No fees to withdraw");
        
        payable(owner).transfer(balance);
    }
    
    /**
     * @dev Transfers ownership of the factory to a new address
     * @param _newOwner The address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "UserFactory: New owner cannot be zero address");
        
        address oldOwner = owner;
        owner = _newOwner;
        
        emit OwnershipTransferred(oldOwner, _newOwner);
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
}
