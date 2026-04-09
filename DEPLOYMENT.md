# Deploying to Base Blockchain

## Prerequisites

1. **MetaMask Wallet** with Base network added
2. **ETH on Base** (for mainnet) or **Base Sepolia ETH** (for testnet)
3. **Private Key** from your wallet

## Step 1: Get Testnet ETH (Base Sepolia)

For testing, you'll need Base Sepolia ETH:

### Option A: Coinbase Faucet (Recommended)
1. Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. Connect your wallet
3. Request testnet ETH

### Option B: Bridge from Ethereum Sepolia
1. Get Sepolia ETH from: https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/

## Step 2: Configure Environment

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your private key to `.env.local`:**
   ```
   PRIVATE_KEY=your_private_key_here
   ```

   **⚠️ IMPORTANT:** 
   - NEVER commit `.env.local` to git
   - Use a wallet with only testnet funds for testing
   - For mainnet, use a hardware wallet or secure key management

3. **Get your private key from MetaMask:**
   - Click on account menu
   - Account Details > Export Private Key
   - Enter password and copy the key

## Step 3: Add Base Network to MetaMask

### Base Sepolia (Testnet)
- Network Name: `Base Sepolia`
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- Currency Symbol: `ETH`
- Block Explorer: `https://sepolia.basescan.org`

### Base Mainnet
- Network Name: `Base`
- RPC URL: `https://mainnet.base.org`
- Chain ID: `8453`
- Currency Symbol: `ETH`
- Block Explorer: `https://basescan.org`

## Step 4: Deploy Contract

### Deploy to Base Sepolia (Testnet - Recommended First)
```bash
npx hardhat run scripts/deploy-base.js --network baseSepolia
```

### Deploy to Base Mainnet (Production)
```bash
npx hardhat run scripts/deploy-base.js --network base
```

## Step 5: Update Frontend Configuration

After deployment, update `.env.local` with the contract address:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...your_contract_address
NEXT_PUBLIC_NETWORK=baseSepolia
```

## Step 6: Verify Contract (Optional but Recommended)

Get a BaseScan API key from: https://basescan.org/myapikey

Add to `.env.local`:
```
BASESCAN_API_KEY=your_api_key
```

Then verify:
```bash
npx hardhat verify --network baseSepolia YOUR_CONTRACT_ADDRESS
```

## Step 7: Start Your App

```bash
npm run dev
```

Visit `http://localhost:3000` and connect your MetaMask wallet!

## Deployment Costs

### Base Sepolia (Testnet)
- **Cost:** FREE (testnet ETH)
- **Estimated Gas:** ~3,000,000 gas
- **Use for:** Testing and development

### Base Mainnet
- **Estimated Cost:** ~0.003 ETH (~$10 at current prices)
- **Gas Price:** ~1 gwei (Base is very cheap!)
- **Use for:** Production deployment

## Troubleshooting

### "Insufficient funds" error
- Make sure you have enough ETH in your wallet
- For testnet, get more from the faucet

### "Invalid API Key" error
- Check your BaseScan API key in `.env.local`
- Make sure there are no extra spaces

### "Network not found" error
- Verify your RPC URLs in `hardhat.config.js`
- Check your internet connection

### Contract verification fails
- Wait a few minutes after deployment
- Make sure you're using the correct network
- Verify the contract address is correct

## Network Information

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Base Mainnet | 8453 | https://mainnet.base.org | https://basescan.org |
| Base Sepolia | 84532 | https://sepolia.base.org | https://sepolia.basescan.org |

## Security Best Practices

1. **Never share your private key**
2. **Use testnet first** before deploying to mainnet
3. **Test all functionality** on testnet
4. **Keep `.env.local` in `.gitignore`**
5. **Use a separate wallet** for deployment
6. **Verify contract source code** on BaseScan

## Support

- Base Documentation: https://docs.base.org/
- Base Discord: https://discord.gg/buildonbase
- Hardhat Documentation: https://hardhat.org/docs