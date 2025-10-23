// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UserProfile
 * @dev Individual user profile contract created by UserFactory
 * @notice Each user gets their own profile contract with unique username
 */
contract UserProfile {
    // State variables
    address public immutable owner;
    string public username;
    address public immutable factory;
    
    // Events
    event UsernameUpdated(address indexed user, string oldUsername, string newUsername);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "UserProfile: Only owner can call this function");
        _;
    }
    
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
        
        owner = _owner;
        username = _username;
        factory = msg.sender;
    }
    
    /**
     * @dev Allows the owner to update their username
     * @param _newUsername The new username
     */
    function updateUsername(string memory _newUsername) external onlyOwner {
        require(bytes(_newUsername).length > 0, "UserProfile: Username cannot be empty");
        
        string memory oldUsername = username;
        username = _newUsername;
        
        emit UsernameUpdated(owner, oldUsername, _newUsername);
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
        return (owner, username, factory);
    }
}
