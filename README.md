# Ethereum User Registration System

A decentralized user registration system built on Ethereum that allows users to create unique profiles by paying a registration fee. Each user gets their own individual smart contract for profile management.

## 🏗️ Architecture

The system consists of two main smart contracts:

### UserFactory Contract
- **Purpose**: Factory contract that creates user profiles
- **Features**: 
  - Registration fee management
  - Username uniqueness enforcement
  - User profile creation
  - Fee collection and withdrawal

### UserProfile Contract
- **Purpose**: Individual profile contract for each user
- **Features**:
  - Username management
  - Profile information storage
  - Owner-only modifications

## 🚀 Features

- ✅ **Decentralized Registration**: Users pay ETH to create profiles
- ✅ **Unique Usernames**: Prevents duplicate usernames across the system
- ✅ **Individual Contracts**: Each user gets their own profile contract
- ✅ **Fee Management**: Configurable registration fees
- ✅ **Owner Controls**: Admin functions for fee management
- ✅ **Event Logging**: Complete transaction transparency
- ✅ **Security**: Built-in access controls and input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Ethereum wallet (MetaMask recommended)
- ETH for gas fees and registration

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto_blue_blocks_backend_eth2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env
   # Edit .env with your RPC URL and private key
   ```

## 🚀 Deployment

### Option 1: Remix IDE (Recommended for beginners)

1. **Go to [Remix IDE](https://remix.ethereum.org/)**

2. **Create two files:**
   - `UserProfile.sol` - Copy from `contracts-for-remix/UserProfile.sol`
   - `UserFactory.sol` - Copy from `contracts-for-remix/UserFactory.sol`

3. **Compile contracts:**
   - Select Solidity compiler version 0.8.20+
   - Click "Compile UserFactory.sol"

4. **Deploy:**
   - Go to "Deploy & Run Transactions"
   - Select "UserFactory" from dropdown
   - **Constructor parameter**: `10000000000000000` (0.01 ETH in wei)
   - Click "Deploy"

### Option 2: Local Deployment

1. **Set up environment:**
   ```bash
   # Copy template
   cp env.template .env
   
   # Edit .env with your credentials
   RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   PRIVATE_KEY=your_private_key_here
   ```

2. **Deploy to testnet:**
   ```bash
   npm run deploy
   ```

## 📖 Usage

### User Registration

1. **Check username availability:**
   ```javascript
   const isAvailable = await userFactory.isUsernameAvailable("myusername");
   ```

2. **Register a new user:**
   ```javascript
   await userFactory.registerUser("myusername", {
     value: ethers.utils.parseEther("0.01") // 0.01 ETH
   });
   ```

3. **Get user profile:**
   ```javascript
   const profileAddress = await userFactory.getUserProfile(userAddress);
   ```

### Profile Management

1. **Update username:**
   ```javascript
   const userProfile = new ethers.Contract(profileAddress, profileABI, signer);
   await userProfile.updateUsername("newusername");
   ```

2. **Get profile info:**
   ```javascript
   const [owner, username, factory] = await userProfile.getProfileInfo();
   ```

## 🔧 Contract Functions

### UserFactory Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `registerUser(string username)` | Register a new user | `username` - desired username |
| `getUserProfile(address user)` | Get user's profile address | `user` - user's wallet address |
| `isUsernameAvailable(string username)` | Check if username is available | `username` - username to check |
| `getRegistrationFee()` | Get current registration fee | None |
| `updateRegistrationFee(uint256 newFee)` | Update registration fee (owner only) | `newFee` - new fee in wei |
| `withdrawFees()` | Withdraw collected fees (owner only) | None |

### UserProfile Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `updateUsername(string newUsername)` | Update username (owner only) | `newUsername` - new username |
| `getProfileInfo()` | Get profile information | None |

## 🌐 Network Support

- **Ethereum Mainnet** - Production deployment
- **Sepolia Testnet** - Testing (recommended)
- **Goerli Testnet** - Testing
- **Local Networks** - Development (Hardhat, Ganache)

## 🔒 Security Features

- **Access Control**: Owner-only functions protected by modifiers
- **Input Validation**: Username length and format validation
- **Reentrancy Protection**: Safe transfer patterns
- **Overflow Protection**: Solidity 0.8.20+ built-in protection
- **Event Logging**: Complete transaction transparency

## 📁 Project Structure

```
crypto_blue_blocks_backend_eth2/
├── contracts/                 # Smart contracts
│   ├── UserFactory.sol       # Factory contract
│   └── UserProfile.sol       # Profile contract
├── scripts/                   # Deployment scripts
│   ├── deploy.js             # Main deployment script
│   ├── registerUser.js       # User registration script
│   └── interactWithProfile.js # Profile interaction script
├── env.template             # Environment variables template
├── package.json             # Project dependencies
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🧪 Testing

Test user registration:
```bash
npm run register
```

Test profile interaction:
```bash
npm run interact
```

## 💰 Gas Costs

- **Deployment**: ~1,500,000 gas
- **User Registration**: ~800,000 gas
- **Username Update**: ~50,000 gas
- **Fee Withdrawal**: ~30,000 gas

*Costs may vary based on network conditions*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Security Notice

- **Never commit private keys** to version control
- **Use testnets** for development and testing
- **Audit contracts** before mainnet deployment
- **Keep private keys secure** and never share them

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review the deployment logs
3. Ensure your environment variables are correct
4. Verify you have sufficient ETH for gas fees

## 📚 Additional Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Ethereum Developer Resources](https://ethereum.org/developers/)
- [Remix IDE](https://remix.ethereum.org/)

---

**Built with ❤️ for the Ethereum ecosystem**
