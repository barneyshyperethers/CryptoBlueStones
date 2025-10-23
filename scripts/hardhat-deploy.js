const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

/**
 * Hardhat deployment script for UserFactory contract
 * This script compiles and deploys the smart contracts using Hardhat
 */

async function main() {
    console.log('🚀 Starting Hardhat deployment...');
    
    // Get the contract factory
    const UserFactory = await ethers.getContractFactory("UserFactory");
    
    // Registration fee: 0.01 ETH = 10000000000000000 wei
    const REGISTRATION_FEE = ethers.parseEther("0.01");
    
    console.log(`🏭 Deploying UserFactory with registration fee: 0.01 ETH`);
    
    // Deploy the contract
    const userFactory = await UserFactory.deploy(REGISTRATION_FEE);
    
    // Wait for deployment to complete
    await userFactory.waitForDeployment();
    
    const userFactoryAddress = await userFactory.getAddress();
    
    console.log(`✅ UserFactory deployed successfully!`);
    console.log(`📍 Contract Address: ${userFactoryAddress}`);
    
    // Get deployment info
    const network = await ethers.provider.getNetwork();
    const deployer = await ethers.provider.getSigner();
    const deployerAddress = await deployer.getAddress();
    
    // Save deployment information
    const deploymentInfo = {
        network: {
            name: network.name,
            chainId: network.chainId.toString(),
            rpcUrl: "hardhat"
        },
        timestamp: new Date().toISOString(),
        deployer: deployerAddress,
        contracts: {
            UserFactory: {
                address: userFactoryAddress,
                registrationFee: REGISTRATION_FEE.toString()
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
    console.log(`🏭 UserFactory: ${userFactoryAddress}`);
    console.log(`💰 Registration Fee: 0.01 ETH`);
    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`📄 Deployment info saved to: deployment.json`);
    
    // Test the deployment
    console.log('\n🧪 Testing deployment...');
    
    try {
        const registrationFee = await userFactory.getRegistrationFee();
        const owner = await userFactory.owner();
        const factoryBalance = await userFactory.getFactoryBalance();
        
        console.log(`✅ Registration Fee: ${ethers.formatEther(registrationFee)} ETH`);
        console.log(`✅ Owner: ${owner}`);
        console.log(`✅ Factory Balance: ${ethers.formatEther(factoryBalance)} ETH`);
        
        console.log('\n📖 Next Steps:');
        console.log('1. Copy the UserFactory address above');
        console.log('2. Use the registration script to register users');
        console.log('3. Use the interaction script to manage profiles');
        
    } catch (error) {
        console.error('❌ Error testing deployment:', error.message);
    }
}

// Handle errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });
