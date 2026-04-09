# ⚡ Quick Fix for Gas Estimation Error

## The Problem
You're seeing: "Gas estimation errored" or "invalid value for value.hash"

## The Solution (Choose One)

### 🔥 FASTEST FIX: Change RPC in MetaMask

1. **Open MetaMask**
2. **Click network dropdown** (top of MetaMask)
3. **Click "Base"** → **Settings icon**
4. **Change RPC URL to:**
   ```
   https://base.llamarpc.com
   ```
5. **Save**
6. **In Remix:** Disconnect and reconnect wallet
7. **Try deploying again**

---

### 🛠️ ALTERNATIVE: Use Hardhat (More Reliable)

**Step 1: Setup**
```bash
cp .env.example .env.local
```

**Step 2: Add your private key to `.env.local`**
```
PRIVATE_KEY=your_private_key_without_0x_prefix
```

**Step 3: Deploy**
```bash
npx hardhat run scripts/deploy-base.js --network base
```

If that fails, try alternative RPC:
```bash
npx hardhat run scripts/deploy-base.js --network baseLlama
```

---

### 🧪 SAFEST: Deploy to Testnet First

**Step 1: Get free testnet ETH**
Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

**Step 2: Add Base Sepolia to MetaMask**
- Network Name: `Base Sepolia`
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- Currency: `ETH`
- Explorer: `https://sepolia.basescan.org`

**Step 3: Deploy to testnet**
```bash
npx hardhat run scripts/deploy-base.js --network baseSepolia
```

**Step 4: Test everything**

**Step 5: Deploy to mainnet when ready**

---

## Why This Happens

The Base RPC endpoint might be:
- Temporarily overloaded
- Having connectivity issues
- Blocked by your ISP/network

Using an alternative RPC or Hardhat solves this.

---

## Which Method Should I Use?

| Method | Time | Difficulty | Reliability |
|--------|------|------------|-------------|
| Change RPC | 2 min | ⭐ Easy | ⭐⭐⭐ Good |
| Use Hardhat | 5 min | ⭐⭐ Medium | ⭐⭐⭐⭐⭐ Excellent |
| Deploy to Testnet | 10 min | ⭐⭐ Medium | ⭐⭐⭐⭐⭐ Excellent |

**Recommendation:** Try changing RPC first. If that doesn't work, use Hardhat.

---

## Need More Help?

See `TROUBLESHOOTING.md` for detailed solutions.