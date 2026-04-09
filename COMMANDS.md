# 📝 Command Reference - Copy & Paste

## Initial Setup (One Time Only)

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
```bash
cp .env.local.template .env.local
```

### 3. Edit .env.local
Open `.env.local` in your editor and add your private key:
```
PRIVATE_KEY=your_private_key_here
```

---

## Deployment Commands

### Deploy to Base Mainnet (Recommended RPC)
```bash
npx hardhat run scripts/deploy-base.js --network baseLlama
```

### Deploy to Base Mainnet (Official RPC)
```bash
npx hardhat run scripts/deploy-base.js --network base
```

### Deploy to Base Sepolia Testnet (Free Testing)
```bash
npx hardhat run scripts/deploy-base.js --network baseSepolia
```

---

## After Deployment

### Update .env.local
After deployment, you'll get a contract address. Update `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
```

### Start the Frontend
```bash
npm run dev
```

Then open: http://localhost:3000

---

## Useful Commands

### Compile Contract
```bash
npx hardhat compile
```

### Check Accounts
```bash
npx hardhat run scripts/accounts.js --network base
```

### Verify Contract on BaseScan
```bash
npx hardhat verify --network base YOUR_CONTRACT_ADDRESS
```

---

## Quick Deploy Script (All in One)

Copy and paste this entire block:

```bash
# Install dependencies (if not done)
npm install

# Create env file (if not exists)
cp .env.local.template .env.local

# Compile contract
npx hardhat compile

# Deploy to Base (using reliable RPC)
npx hardhat run scripts/deploy-base.js --network baseLlama

# After deployment, edit .env.local with contract address, then:
npm run dev
```

---

## Troubleshooting Commands

### Clear Hardhat Cache
```bash
npx hardhat clean
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Test RPC Connection
```bash
npx hardhat run scripts/accounts.js --network baseLlama
```

---

## Network Options

| Network | Command Flag | Cost | Use For |
|---------|-------------|------|---------|
| Base Mainnet (Llama) | `--network baseLlama` | Real ETH | Production (Recommended) |
| Base Mainnet (Official) | `--network base` | Real ETH | Production (Alternative) |
| Base Sepolia | `--network baseSepolia` | Free | Testing |
| Localhost | `--network localhost` | Free | Local Testing |

---

## Complete Deployment Flow

```bash
# 1. Setup
npm install
cp .env.local.template .env.local
# Edit .env.local with your PRIVATE_KEY

# 2. Compile
npx hardhat compile

# 3. Deploy
npx hardhat run scripts/deploy-base.js --network baseLlama

# 4. Copy contract address from output

# 5. Update .env.local with contract address

# 6. Start app
npm run dev

# 7. Open browser
# Visit: http://localhost:3000
```

---

## Environment File Template

Your `.env.local` should look like this:

```env
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_NETWORK=base
```

---

## Common Errors & Fixes

### "Cannot find module"
```bash
npm install
```

### "Network not found"
Check hardhat.config.js has the network configured (it should already)

### "Insufficient funds"
Get more ETH on Base Mainnet

### "Invalid private key"
- Remove "0x" prefix
- Should be 64 characters
- No spaces

### "RPC error"
Use alternative network:
```bash
npx hardhat run scripts/deploy-base.js --network baseLlama
```

---

## Quick Reference

**Deploy:** `npx hardhat run scripts/deploy-base.js --network baseLlama`

**Start App:** `npm run dev`

**Verify:** `npx hardhat verify --network base CONTRACT_ADDRESS`

---

**Copy the deploy command and run it now! 👇**

```bash
npx hardhat run scripts/deploy-base.js --network baseLlama
```