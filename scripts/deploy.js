const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Deployment script for UserFactory and UserProfile contracts
 * This script compiles and deploys the smart contracts to the Ethereum network
 */

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const GAS_PRICE = process.env.GAS_PRICE || '20000000000'; // 20 gwei
const GAS_LIMIT = process.env.GAS_LIMIT || '1000000';

// Registration fee: 0.01 ETH = 10000000000000000 wei
const REGISTRATION_FEE = '10000000000000000';

if (!PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY not found in environment variables');
    console.log('Please set your private key in the .env file');
    process.exit(1);
}

// Initialize Web3
const web3 = new Web3(RPC_URL);

// Get account from private key
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

console.log('🚀 Starting deployment...');
console.log(`📡 Connected to: ${RPC_URL}`);
console.log(`👤 Deploying from: ${account.address}`);

async function deployContract(contractName, contractSource, constructorArgs = []) {
    try {
        console.log(`\n📝 Compiling ${contractName}...`);
        
        // Compile the contract
        const compiledContract = await web3.eth.compileSolidity(contractSource);
        const contractABI = compiledContract[`${contractName}.sol:${contractName}`].info.abiDefinition;
        const contractBytecode = compiledContract[`${contractName}.sol:${contractName}`].code;
        
        console.log(`✅ ${contractName} compiled successfully`);
        
        // Deploy the contract
        console.log(`🚀 Deploying ${contractName}...`);
        
        const contract = new web3.eth.Contract(contractABI);
        
        const deployOptions = {
            data: contractBytecode,
            arguments: constructorArgs
        };
        
        const deployedContract = await contract.deploy(deployOptions).send({
            from: account.address,
            gas: GAS_LIMIT,
            gasPrice: GAS_PRICE
        });
        
        console.log(`✅ ${contractName} deployed successfully!`);
        console.log(`📍 Contract Address: ${deployedContract.options.address}`);
        console.log(`⛽ Gas Used: ${deployedContract.options.gas}`);
        
        return {
            address: deployedContract.options.address,
            abi: contractABI,
            contract: deployedContract
        };
        
    } catch (error) {
        console.error(`❌ Error deploying ${contractName}:`, error.message);
        throw error;
    }
}

async function main() {
    try {
        // Check account balance
        const balance = await web3.eth.getBalance(account.address);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        console.log(`💰 Account Balance: ${balanceInEth} ETH`);
        
        if (parseFloat(balanceInEth) < 0.1) {
            console.warn('⚠️  Warning: Low balance. You may need more ETH for deployment.');
        }
        
        // Read contract sources
        const userProfileSource = fs.readFileSync(
            path.join(__dirname, '../contracts/UserProfile.sol'), 
            'utf8'
        );
        const userFactorySource = fs.readFileSync(
            path.join(__dirname, '../contracts/UserFactory.sol'), 
            'utf8'
        );
        
        // Deploy UserFactory with registration fee
        console.log(`\n🏭 Deploying UserFactory with registration fee: ${web3.utils.fromWei(REGISTRATION_FEE, 'ether')} ETH`);
        
        const userFactory = await deployContract('UserFactory', userFactorySource, [REGISTRATION_FEE]);
        
        // Save deployment information
        const deploymentInfo = {
            network: RPC_URL,
            timestamp: new Date().toISOString(),
            deployer: account.address,
            contracts: {
                UserFactory: {
                    address: userFactory.address,
                    abi: userFactory.abi,
                    registrationFee: REGISTRATION_FEE
                }
            }
        };
        
        // Save to file
        fs.writeFileSync(
            path.join(__dirname, '../deployment.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n🎉 Deployment completed successfully!');
        console.log('\n📋 Deployment Summary:');
        console.log(`🏭 UserFactory: ${userFactory.address}`);
        console.log(`💰 Registration Fee: ${web3.utils.fromWei(REGISTRATION_FEE, 'ether')} ETH`);
        console.log(`📄 Deployment info saved to: deployment.json`);
        
        console.log('\n📖 Next Steps:');
        console.log('1. Copy the UserFactory address above');
        console.log('2. Use the registration script to register users');
        console.log('3. Use the interaction script to manage profiles');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Deployment cancelled by user');
    process.exit(0);
});

// Run deployment
main();

