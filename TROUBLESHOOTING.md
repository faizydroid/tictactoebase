# 🔧 Troubleshooting Gas Estimation Errors

## Error: "Gas estimation errored" / "invalid value for value.hash"

This error typically occurs due to RPC connection issues or network configuration problems.

## Quick Fixes (Try in Order)

### 1. Check MetaMask Network Settings

**Verify Base Mainnet Configuration:**

Open MetaMask → Settings → Networks → Base

**Correct Settings:**
```
Network Name: Base
RPC URL: https://mainnet.base.org
Chain ID: 8453
Currency Symbol: ETH
Block Explorer: https://basescan.org
```

**Alternative RPC URLs (if mainnet.base.org fails):**
- `https://base.llamarpc.com`
- `https://base-rpc.publicnode.com`
- `https://1rpc.io/base`
- `https://base.meowrpc.com`

### 2. Switch RPC Provider

If the default RPC is having issues:

1. Open MetaMask
2. Go to Settings → Networks → Base
3. Change RPC URL to one of the alternatives above
4. Save and try deploying again

### 3. Check Your Wallet Balance

Make sure you have enough ETH:
- Minimum: 0.005 ETH
- Recommended: 0.01 ETH

Check balance:
1. Open MetaMask
2. Ensure you're on Base network
3. Verify ETH balance is sufficient

### 4. Clear MetaMask Cache

1. MetaMask → Settings → Advanced
2. Scroll down to "Clear activity tab data"
3. Click "Clear"
4. Refresh Remix page
5. Reconnect wallet

### 5. Try Different Browser

Sometimes browser extensions conflict:
- Try Chrome if using Brave
- Try Firefox if using Chrome
- Use Incognito/Private mode

### 6. Increase Gas Limit Manually

In Remix:
1. Before deploying, expand "Advanced options"
2. Set Gas Limit manually: `5000000`
3. Try deploying again

### 7. Check Base Network Status

Visit: https://status.base.org/

If Base is experiencing issues:
- Wait for resolution
- Try again in 10-15 minutes

## Alternative Deployment Methods

### Method A: Use Hardhat Instead

If Remix continues to fail, deploy via Hardhat:

1. **Setup environment:**
```bash
cp .env.example .env.local
```

2. **Add your private key to `.env.local`:**
```
PRIVATE_KEY=your_private_key_without_0x
```

3. **Deploy:**
```bash
npx hardhat run scripts/deploy-base.js --network base
```

### Method B: Deploy to Base Sepolia First (Testnet)

Test on testnet before mainnet:

1. **Add Base Sepolia to MetaMask:**
```
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH
Block Explorer: https://sepolia.basescan.org
```

2. **Get free testnet ETH:**
https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

3. **Deploy to testnet first:**
```bash
npx hardhat run scripts/deploy-base.js --network baseSepolia
```

4. **Test everything, then deploy to mainnet**

## Detailed Diagnostics

### Check RPC Connection

Test if RPC is working:

1. Open browser console (F12)
2. Run this in console:
```javascript
fetch('https://mainnet.base.org', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1
  })
})
.then(r => r.json())
.then(console.log)
```

3. Should return a block number
4. If it fails, RPC is down - try alternative RPC

### Check Contract Compilation

Make sure contract compiled without errors:

1. In Remix, check for green checkmark
2. No red errors in console
3. ABI generated successfully

### Verify Account Connection

1. In Remix, check "Deploy & Run" tab
2. Verify account address is shown
3. Verify balance is displayed
4. Try disconnecting and reconnecting MetaMask

## Common Causes & Solutions

| Error Cause | Solution |
|-------------|----------|
| RPC endpoint down | Use alternative RPC URL |
| Insufficient funds | Add more ETH to wallet |
| Network congestion | Wait 10-15 minutes, try again |
| MetaMask cache | Clear cache, reconnect |
| Wrong network | Verify Chain ID is 8453 |
| Browser extension conflict | Try incognito mode |
| Outdated MetaMask | Update MetaMask extension |

## Recommended RPC Configuration

**Best RPC URLs for Base (in order of reliability):**

1. `https://mainnet.base.org` (Official)
2. `https://base.llamarpc.com` (LlamaNodes)
3. `https://1rpc.io/base` (1RPC)
4. `https://base-rpc.publicnode.com` (PublicNode)

**Update in MetaMask:**
Settings → Networks → Base → Edit → Change RPC URL → Save

## Still Having Issues?

### Option 1: Deploy via Hardhat (Recommended)

Hardhat is more reliable for mainnet deployments:

```bash
# Install dependencies (if not done)
npm install

# Setup environment
cp .env.example .env.local

# Add your private key to .env.local
# PRIVATE_KEY=your_key_here

# Deploy to Base Mainnet
npx hardhat run scripts/deploy-base.js --network base
```

### Option 2: Use Different RPC in Remix

1. Update MetaMask RPC to: `https://base.llamarpc.com`
2. Disconnect and reconnect wallet in Remix
3. Try deployment again

### Option 3: Deploy to Testnet First

1. Switch to Base Sepolia testnet
2. Get free testnet ETH
3. Deploy and test there first
4. Once working, deploy to mainnet

## Contact Support

If none of these work:

- **Base Discord:** https://discord.gg/buildonbase
- **Remix Gitter:** https://gitter.im/ethereum/remix
- **Check Base Status:** https://status.base.org/

## Prevention Tips

For future deployments:

1. ✅ Always test on testnet first
2. ✅ Keep multiple RPC URLs configured
3. ✅ Maintain sufficient ETH balance (0.01+)
4. ✅ Use Hardhat for production deployments
5. ✅ Monitor Base network status before deploying

---

**Quick Fix Summary:**

1. Change RPC URL in MetaMask to `https://base.llamarpc.com`
2. Clear MetaMask cache
3. Reconnect wallet in Remix
4. Try deployment again

OR

Use Hardhat deployment instead:
```bash
npx hardhat run scripts/deploy-base.js --network base
```