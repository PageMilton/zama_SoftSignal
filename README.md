# SoftSignal

A privacy-preserving emotion and mental health tracking dApp built with FHEVM (Fully Homomorphic Encryption Virtual Machine) by Zama. SoftSignal enables users to record encrypted emotional data on-chain while maintaining complete privacy through homomorphic encryption.

## 🌟 Features

- **Privacy-Preserving**: All sensitive mental health data is encrypted using FHEVM before being stored on-chain
- **On-Chain Storage**: Emotion entries are stored on Ethereum-compatible networks
- **Trend Analysis**: Compute encrypted trend data without decrypting individual entries
- **User Control**: Users maintain full control over their data with decryption keys
- **Multi-Network Support**: Deploy on localhost, Sepolia testnet, or other EVM-compatible chains

## 📋 Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **MetaMask** or compatible Web3 wallet (for frontend interaction)

## 🏗️ Project Structure

```
zama_SoftSignal/
├── fhevm-hardhat-template/    # Smart contracts and Hardhat configuration
│   ├── contracts/
│   │   └── SoftSignal.sol     # Main FHEVM contract for emotion tracking
│   ├── deploy/                 # Deployment scripts
│   ├── test/                   # Contract tests
│   └── tasks/                  # Hardhat custom tasks
├── softsignal-frontend/        # Next.js frontend application
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and FHEVM integration
│   └── scripts/                # Build and deployment scripts
└── README.md                   # This file
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/PageMilton/zama_SoftSignal.git
cd zama_SoftSignal
```

### 2. Install Dependencies

#### Smart Contracts

```bash
cd fhevm-hardhat-template
npm install
```

#### Frontend

```bash
cd ../softsignal-frontend
npm install
```

### 3. Configure Environment Variables

#### For Smart Contracts

```bash
cd fhevm-hardhat-template

# Set your mnemonic for deployment
npx hardhat vars set MNEMONIC

# Set Infura API key for network access
npx hardhat vars set INFURA_API_KEY

# Optional: Set Etherscan API key for contract verification
npx hardhat vars set ETHERSCAN_API_KEY
```

### 4. Compile and Test Contracts

```bash
cd fhevm-hardhat-template
npm run compile
npm run test
```

### 5. Deploy Contracts

#### Local Network (for development)

```bash
# Terminal 1: Start local FHEVM node
npx hardhat node

# Terminal 2: Deploy to localhost
npx hardhat deploy --network localhost
```

#### Sepolia Testnet

```bash
npx hardhat deploy --network sepolia
```

### 6. Run the Frontend

#### Development Mode with Mock (for local testing)

```bash
cd softsignal-frontend

# Ensure Hardhat node is running, then:
npm run dev:mock
```

#### Development Mode with Real Relayer

```bash
cd softsignal-frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📖 Usage

### Recording an Emotion Entry

1. Connect your wallet to the dApp
2. Navigate to the Diary page
3. Enter your mood, stress level, and sleep quality (0-10 scale)
4. Add optional tags (Work, Family, Health, etc.)
5. Submit the entry - it will be encrypted and stored on-chain

### Viewing Trends

1. Navigate to the Trends or Insights page
2. View aggregated trend data computed on encrypted values
3. Decrypt your own entries using your private key

### Accessing Your Data

- **Dashboard**: Overview of your entries and statistics
- **Diary**: Record new emotion entries
- **Trends**: View trend analysis over time
- **Insights**: Detailed analytics and patterns

## 🔧 Development

### Smart Contract Scripts

```bash
cd fhevm-hardhat-template

# Compile contracts
npm run compile

# Run tests
npm run test

# Run tests on Sepolia
npm run test:sepolia

# Lint code
npm run lint

# Generate coverage report
npm run coverage

# Clean build artifacts
npm run clean
```

### Frontend Scripts

```bash
cd softsignal-frontend

# Development with mock (localhost)
npm run dev:mock

# Development with real relayer
npm run dev

# Build for production
npm run build

# Check static export compatibility
npm run check:static

# Run tests
npm run test

# Lint
npm run lint
```

## 🔐 Security & Privacy

- **Homomorphic Encryption**: All sensitive data is encrypted using FHEVM before being stored on-chain
- **User Control**: Only the user who created an entry can decrypt it
- **On-Chain Computation**: Trend analysis is performed on encrypted values without decryption
- **No Central Authority**: Decryption keys are managed by users, not stored on-chain

## 🌐 Supported Networks

- **Localhost** (Chain ID: 31337) - For local development
- **Sepolia Testnet** (Chain ID: 11155111) - For testing

## 📚 Documentation

### FHEVM Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)

### Project-Specific

- See `fhevm-hardhat-template/README.md` for detailed contract documentation
- Contract source code: `fhevm-hardhat-template/contracts/SoftSignal.sol`

## 🧪 Testing

### Contract Tests

```bash
cd fhevm-hardhat-template
npm run test
```

Tests cover:
- Entry creation and encryption
- Trend computation on encrypted data
- Access control and permissions
- Edge cases and error handling

### Frontend Tests

```bash
cd softsignal-frontend
npm run test
```

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.24
- **FHEVM** ^0.9.1
- **Hardhat** ^2.26.0
- **TypeScript**

### Frontend
- **Next.js** ^15.1.0
- **React** ^19.0.0
- **TypeScript**
- **Tailwind CSS**
- **@zama-fhe/relayer-sdk** ^0.3.0-5
- **@fhevm/mock-utils** 0.3.0-1
- **fhevmjs** ^0.6.0-8
- **ethers** ^6.13.0

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](fhevm-hardhat-template/LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/PageMilton/zama_SoftSignal/issues)
- **FHEVM Documentation**: [docs.zama.ai](https://docs.zama.ai)
- **Zama Community**: [Discord](https://discord.gg/zama)

## 🙏 Acknowledgments

- Built with [FHEVM](https://github.com/zama-ai/fhevm) by [Zama](https://www.zama.ai)
- Based on the [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)

---

**Built with ❤️ using FHEVM**

