const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * User Registration Script
 * This script allows users to register and create their profile contracts
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

console.log('👤 User Registration System');
console.log(`📡 Connected to: ${RPC_URL}`);
console.log(`👤 Registering as: ${account.address}`);

// Load deployment information
let deploymentInfo;
try {
    const deploymentData = fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8');
    deploymentInfo = JSON.parse(deploymentData);
} catch (error) {
    console.error('❌ Error: deployment.json not found. Please run deployment first.');
    process.exit(1);
}

// UserFactory ABI (simplified for interaction)
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
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "profile", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "username", "type": "string"}
        ],
        "name": "UserRegistered",
        "type": "event"
    }
];

async function checkRegistrationStatus() {
    try {
        const userFactory = new web3.eth.Contract(
            userFactoryABI, 
            deploymentInfo.contracts.UserFactory.address
        );
        
        const userProfile = await userFactory.methods.getUserProfile(account.address).call();
        
        if (userProfile !== '0x0000000000000000000000000000000000000000') {
            console.log('✅ User already registered!');
            console.log(`📍 Profile Address: ${userProfile}`);
            return userProfile;
        } else {
            console.log('❌ User not registered yet');
            return null;
        }
    } catch (error) {
        console.error('❌ Error checking registration status:', error.message);
        return null;
    }
}

async function checkUsernameAvailability(username) {
    try {
        const userFactory = new web3.eth.Contract(
            userFactoryABI, 
            deploymentInfo.contracts.UserFactory.address
        );
        
        const isAvailable = await userFactory.methods.isUsernameAvailable(username).call();
        return isAvailable;
    } catch (error) {
        console.error('❌ Error checking username availability:', error.message);
        return false;
    }
}

async function getRegistrationFee() {
    try {
        const userFactory = new web3.eth.Contract(
            userFactoryABI, 
            deploymentInfo.contracts.UserFactory.address
        );
        
        const fee = await userFactory.methods.getRegistrationFee().call();
        return fee;
    } catch (error) {
        console.error('❌ Error getting registration fee:', error.message);
        return null;
    }
}

async function registerUser(username) {
    try {
        console.log(`\n🚀 Registering user with username: ${username}`);
        
        // Check if already registered
        const existingProfile = await checkRegistrationStatus();
        if (existingProfile) {
            console.log('⚠️  User is already registered!');
            return existingProfile;
        }
        
        // Check username availability
        const isAvailable = await checkUsernameAvailability(username);
        if (!isAvailable) {
            console.log('❌ Username is not available. Please choose a different username.');
            return null;
        }
        
        // Get registration fee
        const fee = await getRegistrationFee();
        if (!fee) {
            console.log('❌ Could not get registration fee');
            return null;
        }
        
        console.log(`💰 Registration fee: ${web3.utils.fromWei(fee, 'ether')} ETH`);
        
        // Check account balance
        const balance = await web3.eth.getBalance(account.address);
        if (BigInt(balance) < BigInt(fee)) {
            console.log('❌ Insufficient balance for registration');
            console.log(`💰 Required: ${web3.utils.fromWei(fee, 'ether')} ETH`);
            console.log(`💰 Available: ${web3.utils.fromWei(balance, 'ether')} ETH`);
            return null;
        }
        
        // Register user
        const userFactory = new web3.eth.Contract(
            userFactoryABI, 
            deploymentInfo.contracts.UserFactory.address
        );
        
        console.log('📝 Sending registration transaction...');
        
        const tx = await userFactory.methods.registerUser(username).send({
            from: account.address,
            value: fee,
            gas: GAS_LIMIT,
            gasPrice: GAS_PRICE
        });
        
        console.log('✅ Registration successful!');
        console.log(`📍 Transaction Hash: ${tx.transactionHash}`);
        console.log(`⛽ Gas Used: ${tx.gasUsed}`);
        
        // Get the profile address from the event
        const events = tx.events.UserRegistered;
        if (events && events.returnValues) {
            const profileAddress = events.returnValues.profile;
            console.log(`🎯 Profile Address: ${profileAddress}`);
            
            // Save user info
            const userInfo = {
                username: username,
                profileAddress: profileAddress,
                registrationTx: tx.transactionHash,
                timestamp: new Date().toISOString()
            };
            
            fs.writeFileSync(
                path.join(__dirname, '../user-info.json'),
                JSON.stringify(userInfo, null, 2)
            );
            
            console.log('💾 User info saved to user-info.json');
            
            return profileAddress;
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Registration failed:', error.message);
        return null;
    }
}

async function main() {
    try {
        // Get username from command line arguments
        const username = process.argv[2];
        
        if (!username) {
            console.log('Usage: node scripts/registerUser.js <username>');
            console.log('Example: node scripts/registerUser.js alice123');
            process.exit(1);
        }
        
        if (username.length > 32) {
            console.log('❌ Username too long (max 32 characters)');
            process.exit(1);
        }
        
        console.log(`\n🔍 Checking registration status...`);
        const existingProfile = await checkRegistrationStatus();
        
        if (existingProfile) {
            console.log('✅ User is already registered!');
            console.log(`📍 Profile Address: ${existingProfile}`);
            return;
        }
        
        console.log(`\n🔍 Checking username availability...`);
        const isAvailable = await checkUsernameAvailability(username);
        
        if (!isAvailable) {
            console.log('❌ Username is not available. Please choose a different username.');
            return;
        }
        
        console.log('✅ Username is available!');
        
        // Register the user
        const profileAddress = await registerUser(username);
        
        if (profileAddress) {
            console.log('\n🎉 Registration completed successfully!');
            console.log(`👤 Username: ${username}`);
            console.log(`📍 Profile Address: ${profileAddress}`);
            console.log('\n📖 Next Steps:');
            console.log('1. Use the interaction script to manage your profile');
            console.log('2. Update your username if needed');
        }
        
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Registration cancelled by user');
    process.exit(0);
});

// Run registration
main();

