# 🚀 Quick Guide: Deploy to Base Blockchain

## What You Need

1. ✅ MetaMask wallet
2. ✅ Base Sepolia ETH (free from faucet)
3. ✅ Your wallet's private key

## Step-by-Step Deployment

### 1️⃣ Get Testnet ETH (FREE)

Visit the Coinbase faucet and get free Base Sepolia ETH:
👉 **https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet**

- Connect your MetaMask
- Request testnet ETH
- Wait ~30 seconds for confirmation

### 2️⃣ Add Base Sepolia to MetaMask

**Network Settings:**
- Network Name: `Base Sepolia`
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- Currency: `ETH`
- Explorer: `https://sepolia.basescan.org`

### 3️⃣ Get Your Private Key

In MetaMask:
1. Click your account icon
2. Go to "Account Details"
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key

⚠️ **SECURITY WARNING:** Never share this key or commit it to git!

### 4️⃣ Configure Environment

Create `.env.local` file in your project root:

```env
PRIVATE_KEY=your_private_key_here_without_0x
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_NETWORK=baseSepolia
```

### 5️⃣ Deploy Contract

Run the deployment command:

```bash
npx hardhat run scripts/deploy-base.js --network baseSepolia
```

You should see output like:
```
🚀 Deploying TicTacToe contract to baseSepolia...
📍 Deploying from account: 0x...
💰 Account balance: 0.5 ETH
⏳ Deploying contract...
✅ TicTacToe deployed successfully!
📄 Contract address: 0x1234...5678
```

### 6️⃣ Update Configuration

Copy the contract address from the deployment output and update `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234...5678
```

### 7️⃣ Start Your App

```bash
npm run dev
```

Open http://localhost:3000 and connect your MetaMask!

## Deployment Costs

### Base Sepolia (Testnet)
- **Cost:** FREE ✨
- **Gas:** ~3M gas units
- **Time:** ~2 seconds

### Base Mainnet (Production)
- **Cost:** ~0.003 ETH (~$10)
- **Gas Price:** ~1 gwei (very cheap!)
- **Time:** ~2 seconds

## Verify Your Contract (Optional)

1. Get API key from: https://basescan.org/myapikey
2. Add to `.env.local`: `BASESCAN_API_KEY=your_key`
3. Run verification:

```bash
npx hardhat verify --network baseSepolia YOUR_CONTRACT_ADDRESS
```

## Troubleshooting

### ❌ "Insufficient funds"
- Get more ETH from the faucet
- Make sure you're on Base Sepolia network

### ❌ "Invalid private key"
- Remove "0x" prefix from private key
- Make sure there are no spaces

### ❌ "Network not found"
- Check your internet connection
- Verify RPC URL in hardhat.config.js

### ❌ Contract not showing in app
- Verify contract address in .env.local
- Restart your dev server (npm run dev)
- Clear browser cache and reconnect wallet

## What Happens After Deployment?

Your smart contract is now live on Base Sepolia! It includes:

✅ Player registration system  
✅ Username management  
✅ Game creation and matchmaking  
✅ Move validation and game logic  
✅ Win/loss tracking  
✅ Leaderboard functionality  

Every game action (registration, creating games, making moves) will be a blockchain transaction!

## Moving to Production (Base Mainnet)

When you're ready to go live:

1. **Test thoroughly** on Base Sepolia first
2. **Get real ETH** on Base Mainnet
3. **Deploy to mainnet:**
   ```bash
   npx hardhat run scripts/deploy-base.js --network base
   ```
4. **Update** `.env.local` with new contract address
5. **Verify** contract on BaseScan

## Resources

- 📚 Base Docs: https://docs.base.org/
- 🔍 BaseScan: https://basescan.org/
- 💬 Base Discord: https://discord.gg/buildonbase
- 🌉 Base Bridge: https://bridge.base.org/

## Need Help?

Check the detailed guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Happy Building! 🎮⛓️**