# On-Chain Tic Tac Toe
BkyokD4nvs_0cbz7-_zrg5-OW66s23eBZrwBbHT2-CPQ5WL9uUH85KlLCtmQ2IciDeVFYDSjguj0ayvShv_Kyg
A multiplayer tic-tac-toe game built on blockchain with wallet authentication and real-time gameplay.

## Features

- 🔐 Wallet-based authentication
- 👤 Username registration on-chain
- 🏆 Leaderboard with stats tracking
- 🎮 Multiplayer gameplay (friend codes & random matching)
- ⛓️ Every move is a blockchain transaction
- 📊 Win/loss tracking and statistics

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start local blockchain:**
   ```bash
   npx hardhat node
   ```

3. **Deploy contract:**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

4. **Update contract address:**
   - Copy the deployed contract address
   - Create `.env.local` file from `.env.example`
   - Add the contract address to `NEXT_PUBLIC_CONTRACT_ADDRESS`

5. **Start the app:**
   ```bash
   npm run dev
   ```

6. **Connect MetaMask:**
   - Add localhost network (RPC: http://127.0.0.1:8545, Chain ID: 31337)
   - Import test accounts from Hardhat node output

## How to Play

1. **Connect Wallet** - Connect your MetaMask wallet
2. **Register** - Create a username (one-time blockchain transaction)
3. **Choose Game Mode:**
   - **Play with Friend** - Share a 6-digit code
   - **Random Match** - Get matched with another player
4. **Play** - Each move is a blockchain transaction
5. **Win/Lose** - Stats are automatically updated on-chain

## Game Flow

```
Connect Wallet → Register Username → Homepage → Choose Game Mode → Play → Results
```

## Smart Contract

The `TicTacToe.sol` contract handles:
- Player registration and usernames
- Game creation and management
- Move validation and game logic
- Win/loss tracking and statistics
- Leaderboard data

## Tech Stack

- **Frontend:** Next.js, React, TailwindCSS
- **Blockchain:** Solidity, Hardhat, Ethers.js
- **Wallet:** MetaMask integration
- **Styling:** TailwindCSS

## Development

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to testnet
npm run deploy
```

## Network Support

- Local development (Hardhat network)
- Base Mainnet (Chain ID: 8453)
- Base Sepolia Testnet (Chain ID: 84532)
- Can be deployed to any EVM-compatible network

## Deploy to Base Blockchain

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to Base Sepolia

1. Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Add your `PRIVATE_KEY` to `.env.local`
3. Deploy: `npx hardhat run scripts/deploy-base.js --network baseSepolia`
4. Update contract address in `.env.local`

### Base Network Info

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Base Mainnet | 8453 | https://mainnet.base.org |
| Base Sepolia | 84532 | https://sepolia.base.org |