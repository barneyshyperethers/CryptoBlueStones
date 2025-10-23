const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

/**
 * Simple deployment script for testing without environment variables
 * This script uses a mock account for demonstration purposes
 */

// Configuration for local testing
const RPC_URL = 'http://localhost:8545'; // Local Ganache or Hardhat
const GAS_PRICE = '20000000000'; // 20 gwei
const GAS_LIMIT = '1000000';

// Registration fee: 0.01 ETH = 10000000000000000 wei
const REGISTRATION_FEE = '10000000000000000';

// Mock private key for testing (DO NOT USE IN PRODUCTION)
const MOCK_PRIVATE_KEY = '0x1234567890123456789012345678901234567890123456789012345678901234';

console.log('🚀 Starting simple deployment...');
console.log(`📡 Connected to: ${RPC_URL}`);

async function deployContract(contractName, contractSource, constructorArgs = []) {
    try {
        console.log(`\n📝 Compiling ${contractName}...`);
        
        // Initialize Web3
        const web3 = new Web3(RPC_URL);
        
        // Create mock account
        const account = web3.eth.accounts.privateKeyToAccount(MOCK_PRIVATE_KEY);
        web3.eth.accounts.wallet.add(account);
        
        console.log(`👤 Using mock account: ${account.address}`);
        
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
        console.log(`\n🏭 Deploying UserFactory with registration fee: 0.01 ETH`);
        
        const userFactory = await deployContract('UserFactory', userFactorySource, [REGISTRATION_FEE]);
        
        // Save deployment information
        const deploymentInfo = {
            network: RPC_URL,
            timestamp: new Date().toISOString(),
            deployer: 'mock-account',
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
        console.log(`💰 Registration Fee: 0.01 ETH`);
        console.log(`📄 Deployment info saved to: deployment.json`);
        
        console.log('\n📖 Next Steps:');
        console.log('1. Copy the UserFactory address above');
        console.log('2. Use the registration script to register users');
        console.log('3. Use the interaction script to manage profiles');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure you have a local Ethereum node running (Ganache, Hardhat, etc.)');
        console.log('2. Check that the RPC_URL is correct');
        console.log('3. Ensure your contracts compile without errors');
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
