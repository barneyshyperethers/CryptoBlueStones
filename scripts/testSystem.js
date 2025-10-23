const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * System Test Script
 * This script tests the entire user registration system
 */

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GAS_PRICE = process.env.GAS_PRICE || '20000000000';
const GAS_LIMIT = process.env.GAS_LIMIT || '500000';

if (!PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in environment variables');
    process.exit(1);
}

// Initialize Web3
const web3 = new Web3(RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

console.log('🧪 User Registration System Test');
console.log(`📡 Connected to: ${RPC_URL}`);
console.log(`👤 Testing as: ${account.address}`);

// Load deployment information
let deploymentInfo;
try {
    const deploymentData = fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8');
    deploymentInfo = JSON.parse(deploymentData);
} catch (error) {
    console.error('❌ Error: deployment.json not found. Please run deployment first.');
    process.exit(1);
}

// UserFactory ABI for testing
const userFactoryABI = [
    {
        "inputs": [{"internalType": "string", "name": "_username", "type": "string"}],
        "name": "registerUser",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
        "name": "getUserProfile",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_username", "type": "string"}],
        "name": "isUsernameAvailable",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getRegistrationFee",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getFactoryBalance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// UserProfile ABI for testing
const userProfileABI = [
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "username",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "factory",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "string", "name": "_newUsername", "type": "string"}],
        "name": "updateUsername",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

async function testFactoryContract() {
    console.log('\n🏭 Testing UserFactory Contract...');
    
    try {
        const factory = new web3.eth.Contract(
            userFactoryABI, 
            deploymentInfo.contracts.UserFactory.address
        );
        
        // Test 1: Get registration fee
        console.log('📋 Test 1: Getting registration fee...');
        const fee = await factory.methods.getRegistrationFee().call();
        console.log(`✅ Registration fee: ${web3.utils.fromWei(fee, 'ether')} ETH`);
        
        // Test 2: Check factory balance
        console.log('📋 Test 2: Checking factory balance...');
        const balance = await factory.methods.getFactoryBalance().call();
        console.log(`✅ Factory balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);
        
        // Test 3: Check username availability
        console.log('📋 Test 3: Checking username availability...');
        const testUsername = 'testuser' + Date.now();
        const isAvailable = await factory.methods.isUsernameAvailable(testUsername).call();
        console.log(`✅ Username "${testUsername}" available: ${isAvailable}`);
        
        // Test 4: Check if user is already registered
        console.log('📋 Test 4: Checking user registration status...');
        const userProfile = await factory.methods.getUserProfile(account.address).call();
        if (userProfile !== '0x0000000000000000000000000000000000000000') {
            console.log(`✅ User already registered with profile: ${userProfile}`);
            return userProfile;
        } else {
            console.log('ℹ️  User not registered yet');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Factory contract test failed:', error.message);
        return null;
    }
}

async function testProfileContract(profileAddress) {
    if (!profileAddress) {
        console.log('⚠️  No profile address provided, skipping profile tests');
        return;
    }
    
    console.log('\n👤 Testing UserProfile Contract...');
    
    try {
        const profile = new web3.eth.Contract(
            userProfileABI, 
            profileAddress
        );
        
        // Test 1: Get profile owner
        console.log('📋 Test 1: Getting profile owner...');
        const owner = await profile.methods.owner().call();
        console.log(`✅ Profile owner: ${owner}`);
        console.log(`✅ Matches current account: ${owner.toLowerCase() === account.address.toLowerCase()}`);
        
        // Test 2: Get username
        console.log('📋 Test 2: Getting username...');
        const username = await profile.methods.username().call();
        console.log(`✅ Username: ${username}`);
        
        // Test 3: Get factory address
        console.log('📋 Test 3: Getting factory address...');
        const factory = await profile.methods.factory().call();
        console.log(`✅ Factory address: ${factory}`);
        console.log(`✅ Matches deployed factory: ${factory.toLowerCase() === deploymentInfo.contracts.UserFactory.address.toLowerCase()}`);
        
        return {
            owner,
            username,
            factory
        };
        
    } catch (error) {
        console.error('❌ Profile contract test failed:', error.message);
        return null;
    }
}

async function testUsernameUpdate(profileAddress, newUsername) {
    if (!profileAddress) {
        console.log('⚠️  No profile address provided, skipping username update test');
        return;
    }
    
    console.log('\n🔄 Testing Username Update...');
    
    try {
        const profile = new web3.eth.Contract(
            userProfileABI, 
            profileAddress
        );
        
        // Get current username
        const currentUsername = await profile.methods.username().call();
        console.log(`📋 Current username: ${currentUsername}`);
        
        // Update username
        console.log(`📝 Updating username to: ${newUsername}`);
        const tx = await profile.methods.updateUsername(newUsername).send({
            from: account.address,
            gas: GAS_LIMIT,
            gasPrice: GAS_PRICE
        });
        
        console.log('✅ Username updated successfully!');
        console.log(`📍 Transaction Hash: ${tx.transactionHash}`);
        console.log(`⛽ Gas Used: ${tx.gasUsed}`);
        
        // Verify the update
        const updatedUsername = await profile.methods.username().call();
        console.log(`✅ New username: ${updatedUsername}`);
        console.log(`✅ Update successful: ${updatedUsername === newUsername}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Username update test failed:', error.message);
        return false;
    }
}

async function runFullTest() {
    console.log('\n🧪 Running Full System Test...');
    
    try {
        // Test 1: Factory contract
        const profileAddress = await testFactoryContract();
        
        // Test 2: Profile contract (if exists)
        const profileInfo = await testProfileContract(profileAddress);
        
        // Test 3: Username update (if profile exists)
        if (profileAddress && profileInfo) {
            const newUsername = 'updateduser' + Date.now();
            await testUsernameUpdate(profileAddress, newUsername);
        }
        
        console.log('\n🎉 All tests completed!');
        
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

async function main() {
    try {
        const testType = process.argv[2];
        
        switch (testType) {
            case 'factory':
                await testFactoryContract();
                break;
                
            case 'profile':
                const profileAddress = process.argv[3];
                if (!profileAddress) {
                    console.log('❌ Please provide a profile address');
                    console.log('Usage: node scripts/testSystem.js profile <profile_address>');
                    process.exit(1);
                }
                await testProfileContract(profileAddress);
                break;
                
            case 'update':
                const profileAddr = process.argv[3];
                const newUsername = process.argv[4];
                if (!profileAddr || !newUsername) {
                    console.log('❌ Please provide profile address and new username');
                    console.log('Usage: node scripts/testSystem.js update <profile_address> <new_username>');
                    process.exit(1);
                }
                await testUsernameUpdate(profileAddr, newUsername);
                break;
                
            case 'full':
            default:
                await runFullTest();
                break;
        }
        
    } catch (error) {
        console.error('❌ Test script failed:', error.message);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Test cancelled by user');
    process.exit(0);
});

// Run tests
main();

