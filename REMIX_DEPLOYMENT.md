# 🎨 Deploy to Base Mainnet using Remix IDE

## Why Remix?
- ✅ No local setup needed
- ✅ Visual interface for deployment
- ✅ Easy contract verification
- ✅ Direct MetaMask integration

## Step-by-Step Guide

### 1️⃣ Prepare Your Wallet

**Add Base Mainnet to MetaMask:**
- Network Name: `Base`
- RPC URL: `https://mainnet.base.org`
- Chain ID: `8453`
- Currency Symbol: `ETH`
- Block Explorer: `https://basescan.org`

**Get ETH on Base:**
- Option A: Bridge from Ethereum → https://bridge.base.org/
- Option B: Buy directly on Coinbase and withdraw to Base
- Option C: Use a DEX to swap to Base ETH

**Recommended Amount:** ~0.01 ETH (deployment costs ~0.003 ETH)

### 2️⃣ Open Remix IDE

1. Go to: **https://remix.ethereum.org/**
2. You'll see the Remix interface with file explorer on the left

### 3️⃣ Create the Contract File

1. In the **File Explorer** (left panel), click the "+" icon to create a new file
2. Name it: `TicTacToe.sol`
3. Copy the entire contract code from `contracts/TicTacToe.sol` in your project
4. Paste it into Remix

**Contract is ready at:** `contracts/TicTacToe.sol` in your project folder

### 4️⃣ Compile the Contract

1. Click on the **"Solidity Compiler"** icon (left sidebar, 2nd icon)
2. Select compiler version: `0.8.19`
3. Enable **"Optimization"** (recommended)
   - Set runs to: `200`
4. Click **"Compile TicTacToe.sol"**
5. Wait for green checkmark ✅

### 5️⃣ Connect MetaMask to Base

1. Make sure MetaMask is on **Base Mainnet** network
2. Check you have enough ETH (~0.01 ETH recommended)

### 6️⃣ Deploy the Contract

1. Click on **"Deploy & Run Transactions"** icon (left sidebar, 3rd icon)
2. In **ENVIRONMENT** dropdown, select: `Injected Provider - MetaMask`
3. MetaMask will popup - click **"Connect"**
4. Verify the network shows: **Base (8453)**
5. In **CONTRACT** dropdown, select: `TicTacToe`
6. Click the orange **"Deploy"** button
7. MetaMask will popup with transaction details:
   - **Estimated Gas:** ~3,000,000 gas
   - **Cost:** ~0.003 ETH (~$10)
8. Click **"Confirm"** in MetaMask
9. Wait for deployment (~2-5 seconds)

### 7️⃣ Get Your Contract Address

After deployment:
1. Look at the **Deployed Contracts** section (bottom of left panel)
2. You'll see your contract with an address like: `0x1234...5678`
3. Click the **copy icon** next to the address
4. **Save this address!** You'll need it for your frontend

### 8️⃣ Verify Contract on BaseScan (Recommended)

**Option A: Using Remix Plugin**
1. In Remix, go to **Plugin Manager** (plug icon in left sidebar)
2. Search for and activate: **"Contract Verification - Etherscan"**
3. Click the new verification icon in left sidebar
4. Select your contract
5. Enter your BaseScan API key (get from: https://basescan.org/myapikey)
6. Click **"Verify"**

**Option B: Manual Verification on BaseScan**
1. Go to: https://basescan.org/verifyContract
2. Enter your contract address
3. Select:
   - Compiler Type: `Solidity (Single file)`
   - Compiler Version: `v0.8.19+commit...`
   - License: `MIT`
4. Paste your contract code
5. If optimization was enabled: Check "Optimization" and set runs to `200`
6. Click **"Verify and Publish"**

### 9️⃣ Update Your Frontend

1. Open `.env.local` in your project
2. Update with your deployed contract address:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
NEXT_PUBLIC_NETWORK=base
```

3. The contract ABI is already in your project, but if you need to update it:
   - In Remix, go to **Solidity Compiler** tab
   - Scroll down and click **"ABI"** button
   - Copy the ABI
   - Create/update `contracts/TicTacToe.json`:

```json
{
  "address": "0xYourContractAddressHere",
  "network": "base",
  "chainId": 8453,
  "abi": [paste ABI here]
}
```

### 🔟 Test Your Deployment

1. Start your frontend:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Connect MetaMask (make sure you're on Base Mainnet)

4. Test the flow:
   - Register username
   - Check leaderboard
   - Create a game
   - Make moves

## 📊 Deployment Costs on Base Mainnet

| Action | Estimated Gas | Cost (at 1 gwei) |
|--------|---------------|------------------|
| Deploy Contract | ~3,000,000 | ~0.003 ETH (~$10) |
| Register Player | ~100,000 | ~0.0001 ETH (~$0.30) |
| Create Game | ~150,000 | ~0.00015 ETH (~$0.50) |
| Make Move | ~80,000 | ~0.00008 ETH (~$0.25) |

**Total for full game:** ~$1-2 (very affordable!)

## ✅ Deployment Checklist

- [ ] MetaMask has Base Mainnet network
- [ ] Wallet has ~0.01 ETH on Base
- [ ] Contract compiled successfully in Remix
- [ ] Contract deployed to Base Mainnet
- [ ] Contract address copied and saved
- [ ] Contract verified on BaseScan
- [ ] `.env.local` updated with contract address
- [ ] Frontend tested with deployed contract

## 🔍 View Your Contract

After deployment, view your contract on BaseScan:
```
https://basescan.org/address/YOUR_CONTRACT_ADDRESS
```

You can see:
- All transactions
- Contract code (after verification)
- Read/Write contract functions
- Events emitted

## 🆘 Troubleshooting

### ❌ "Gas estimation failed"
- Make sure you have enough ETH
- Try increasing gas limit manually

### ❌ "Transaction failed"
- Check you're on Base Mainnet (not testnet)
- Verify you have enough ETH for gas

### ❌ "Contract not verified"
- Make sure compiler version matches (0.8.19)
- Check optimization settings match
- Ensure you copied the complete contract code

### ❌ "Frontend can't connect to contract"
- Verify contract address in `.env.local`
- Check you're on Base Mainnet in MetaMask
- Clear browser cache and reconnect wallet
- Restart dev server

## 🎮 After Deployment

Your game is now LIVE on Base Mainnet! 🎉

**Share with users:**
- Contract Address: `0xYour...Address`
- Network: Base Mainnet
- Block Explorer: https://basescan.org/address/YOUR_ADDRESS

**Next Steps:**
1. Test all features thoroughly
2. Share with friends to test multiplayer
3. Monitor transactions on BaseScan
4. Consider adding more features!

## 📚 Resources

- Remix IDE: https://remix.ethereum.org/
- Base Docs: https://docs.base.org/
- BaseScan: https://basescan.org/
- Base Bridge: https://bridge.base.org/

---

**Good luck with your deployment! 🚀**