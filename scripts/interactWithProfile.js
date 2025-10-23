const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Profile Interaction Script
 * This script allows users to interact with their profile contracts
 */

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GAS_PRICE = process.env.GAS_PRICE || '20000000000';
const GAS_LIMIT = process.env.GAS_LIMIT || '200000';

if (!PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in environment variables');
    process.exit(1);
}

// Initialize Web3
const web3 = new Web3(RPC_URL);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

console.log('👤 Profile Interaction System');
console.log(`📡 Connected to: ${RPC_URL}`);
console.log(`👤 Interacting as: ${account.address}`);

// Load deployment and user information
let deploymentInfo, userInfo;
try {
    const deploymentData = fs.readFileSync(path.join(__dirname, '../deployment.json'), 'utf8');
    deploymentInfo = JSON.parse(deploymentData);
} catch (error) {
    console.error('❌ Error: deployment.json not found. Please run deployment first.');
    process.exit(1);
}

try {
    const userData = fs.readFileSync(path.join(__dirname, '../user-info.json'), 'utf8');
    userInfo = JSON.parse(userData);
} catch (error) {
    console.error('❌ Error: user-info.json not found. Please register first.');
    process.exit(1);
}

// UserProfile ABI (simplified for interaction)
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
    },
    {
        "inputs": [],
        "name": "getProfileInfo",
        "outputs": [
            {"internalType": "address", "name": "_owner", "type": "address"},
            {"internalType": "string", "name": "_username", "type": "string"},
            {"internalType": "address", "name": "_factory", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "string", "name": "oldUsername", "type": "string"},
            {"indexed": false, "internalType": "string", "name": "newUsername", "type": "string"}
        ],
        "name": "UsernameUpdated",
        "type": "event"
    }
];

async function getProfileInfo() {
    try {
        const profile = new web3.eth.Contract(
            userProfileABI, 
            userInfo.profileAddress
        );
        
        const info = await profile.methods.getProfileInfo().call();
        
        console.log('\n📋 Profile Information:');
        console.log(`👤 Owner: ${info._owner}`);
        console.log(`🏷️  Username: ${info._username}`);
        console.log(`🏭 Factory: ${info._factory}`);
        console.log(`📍 Profile Address: ${userInfo.profileAddress}`);
        
        return info;
    } catch (error) {
        console.error('❌ Error getting profile info:', error.message);
        return null;
    }
}

async function updateUsername(newUsername) {
    try {
        console.log(`\n🔄 Updating username to: ${newUsername}`);
        
        if (newUsername.length > 32) {
            console.log('❌ Username too long (max 32 characters)');
            return false;
        }
        
        if (newUsername.length === 0) {
            console.log('❌ Username cannot be empty');
            return false;
        }
        
        const profile = new web3.eth.Contract(
            userProfileABI, 
            userInfo.profileAddress
        );
        
        console.log('📝 Sending username update transaction...');
        
        const tx = await profile.methods.updateUsername(newUsername).send({
            from: account.address,
            gas: GAS_LIMIT,
            gasPrice: GAS_PRICE
        });
        
        console.log('✅ Username updated successfully!');
        console.log(`📍 Transaction Hash: ${tx.transactionHash}`);
        console.log(`⛽ Gas Used: ${tx.gasUsed}`);
        
        // Update local user info
        userInfo.username = newUsername;
        userInfo.lastUpdate = new Date().toISOString();
        
        fs.writeFileSync(
            path.join(__dirname, '../user-info.json'),
            JSON.stringify(userInfo, null, 2)
        );
        
        console.log('💾 User info updated locally');
        
        return true;
        
    } catch (error) {
        console.error('❌ Username update failed:', error.message);
        return false;
    }
}

async function listenToEvents() {
    try {
        console.log('\n👂 Listening for profile events...');
        console.log('Press Ctrl+C to stop listening\n');
        
        const profile = new web3.eth.Contract(
            userProfileABI, 
            userInfo.profileAddress
        );
        
        // Listen for UsernameUpdated events
        profile.events.UsernameUpdated({
            fromBlock: 'latest'
        }, (error, event) => {
            if (error) {
                console.error('❌ Event listening error:', error.message);
                return;
            }
            
            console.log('🔔 Username Updated Event:');
            console.log(`👤 User: ${event.returnValues.user}`);
            console.log(`🏷️  Old Username: ${event.returnValues.oldUsername}`);
            console.log(`🏷️  New Username: ${event.returnValues.newUsername}`);
            console.log(`📍 Transaction: ${event.transactionHash}`);
            console.log(`⏰ Block: ${event.blockNumber}\n`);
        });
        
        // Keep the process alive
        process.stdin.resume();
        
    } catch (error) {
        console.error('❌ Error setting up event listening:', error.message);
    }
}

async function main() {
    try {
        const action = process.argv[2];
        const parameter = process.argv[3];
        
        console.log(`\n🎯 Profile Address: ${userInfo.profileAddress}`);
        console.log(`👤 Current Username: ${userInfo.username}`);
        
        switch (action) {
            case 'info':
                await getProfileInfo();
                break;
                
            case 'update':
                if (!parameter) {
                    console.log('❌ Please provide a new username');
                    console.log('Usage: node scripts/interactWithProfile.js update <new_username>');
                    process.exit(1);
                }
                await updateUsername(parameter);
                break;
                
            case 'listen':
                await listenToEvents();
                break;
                
            default:
                console.log('\n📖 Available Commands:');
                console.log('  info                    - Show profile information');
                console.log('  update <new_username>   - Update username');
                console.log('  listen                  - Listen for profile events');
                console.log('\nExamples:');
                console.log('  node scripts/interactWithProfile.js info');
                console.log('  node scripts/interactWithProfile.js update alice_new');
                console.log('  node scripts/interactWithProfile.js listen');
                break;
        }
        
    } catch (error) {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Interaction cancelled by user');
    process.exit(0);
});

// Run interaction
main();

