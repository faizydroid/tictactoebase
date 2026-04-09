# 🚀 Remix Deployment - Quick Reference

## Before You Start

✅ MetaMask installed  
✅ Base Mainnet added (Chain ID: 8453, RPC: https://mainnet.base.org)  
✅ ~0.01 ETH on Base Mainnet  

## 5-Minute Deployment

### 1. Open Remix
👉 https://remix.ethereum.org/

### 2. Create Contract File
- Click "+" to create new file
- Name: `TicTacToe.sol`
- Copy/paste from: `contracts/TicTacToe.sol`

### 3. Compile
- Click "Solidity Compiler" icon (2nd icon)
- Version: `0.8.19`
- Enable Optimization: `200` runs
- Click "Compile TicTacToe.sol"

### 4. Deploy
- Click "Deploy & Run" icon (3rd icon)
- Environment: `Injected Provider - MetaMask`
- Connect MetaMask to Base Mainnet
- Contract: `TicTacToe`
- Click "Deploy"
- Confirm in MetaMask (~0.003 ETH)

### 5. Copy Contract Address
- Find in "Deployed Contracts" section
- Click copy icon
- Save the address!

### 6. Update Frontend
Edit `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourAddressHere
NEXT_PUBLIC_NETWORK=base
```

### 7. Start App
```bash
npm run dev
```

## Contract Details

**File:** `contracts/TicTacToe.sol`  
**Compiler:** 0.8.19  
**Optimization:** Enabled (200 runs)  
**License:** MIT  

## Deployment Cost

💰 **~0.003 ETH** (~$10 USD)

## After Deployment

✅ Verify on BaseScan: https://basescan.org/verifyContract  
✅ Test registration, games, and leaderboard  
✅ Share with friends!  

## Need Help?

📖 Full Guide: `REMIX_DEPLOYMENT.md`  
🔍 BaseScan: https://basescan.org/  
💬 Base Discord: https://discord.gg/buildonbase  

---

**Contract Address:** ________________  
**Deployed On:** ________________  
**BaseScan Link:** https://basescan.org/address/________________