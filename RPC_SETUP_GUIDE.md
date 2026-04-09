# 🌐 RPC Setup Guide for Base Network

## What is RPC?

RPC (Remote Procedure Call) is the endpoint your wallet uses to communicate with the blockchain. If the RPC is down or slow, you'll get errors.

## Recommended RPC URLs for Base

### Primary (Official)
```
https://mainnet.base.org
```
- Official Base RPC
- Usually most reliable
- Sometimes congested

### Alternative #1 (LlamaNodes) ⭐ RECOMMENDED
```
https://base.llamarpc.com
```
- Very reliable
- Good uptime
- Fast response

### Alternative #2 (1RPC)
```
https://1rpc.io/base
```
- Privacy-focused
- Good performance
- No tracking

### Alternative #3 (PublicNode)
```
https://base-rpc.publicnode.com
```
- Community-run
- Reliable
- Free

### Alternative #4 (Meow RPC)
```
https://base.meowrpc.com
```
- Fast
- Good for development
- Reliable

## How to Change RPC in MetaMask

### Step-by-Step with Screenshots

**Step 1: Open MetaMask**
```
Click the MetaMask extension icon in your browser
```

**Step 2: Access Networks**
```
Click the network dropdown at the top
(Shows current network like "Base" or "Ethereum Mainnet")
```

**Step 3: Find Base Network**
```
Scroll to find "Base" in the list
Click the settings/gear icon next to it
```

**Step 4: Edit Network**
```
You'll see the network configuration screen:

┌─────────────────────────────────────┐
│  Edit Network                       │
├─────────────────────────────────────┤
│  Network Name: Base                 │
│  RPC URL: [current URL]             │
│  Chain ID: 8453                     │
│  Currency Symbol: ETH               │
│  Block Explorer: https://...        │
│                                     │
│  [Cancel]  [Save]                   │
└─────────────────────────────────────┘
```

**Step 5: Change RPC URL**
```
Click in the "RPC URL" field
Delete the current URL
Paste new URL: https://base.llamarpc.com
```

**Step 6: Save**
```
Click "Save" button
MetaMask will test the connection
```

**Step 7: Verify**
```
Check that:
- Network name still shows "Base"
- Chain ID is still 8453
- You can see your balance
```

## Add Multiple Base Networks (Recommended)

You can add Base multiple times with different RPCs:

### Base (Official)
```
Network Name: Base
RPC URL: https://mainnet.base.org
Chain ID: 8453
Currency: ETH
Explorer: https://basescan.org
```

### Base (Llama)
```
Network Name: Base Llama
RPC URL: https://base.llamarpc.com
Chain ID: 8453
Currency: ETH
Explorer: https://basescan.org
```

### Base (1RPC)
```
Network Name: Base 1RPC
RPC URL: https://1rpc.io/base
Chain ID: 8453
Currency: ETH
Explorer: https://basescan.org
```

Then you can switch between them if one is slow!

## Testing RPC Connection

### Method 1: Check in Browser Console

1. Open browser console (F12)
2. Paste this code:

```javascript
async function testRPC(url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    const data = await response.json();
    console.log(`✅ ${url} - Block: ${parseInt(data.result, 16)}`);
    return true;
  } catch (error) {
    console.log(`❌ ${url} - Failed: ${error.message}`);
    return false;
  }
}

// Test all RPCs
const rpcs = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://1rpc.io/base',
  'https://base-rpc.publicnode.com'
];

rpcs.forEach(testRPC);
```

3. See which RPCs are working

### Method 2: Use Online Tool

Visit: https://chainlist.org/chain/8453

- Shows all available RPCs for Base
- Can add directly to MetaMask
- Shows latency for each RPC

## For Hardhat Users

Update your `hardhat.config.js`:

```javascript
networks: {
  base: {
    url: process.env.BASE_RPC_URL || "https://base.llamarpc.com",
    accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    chainId: 8453,
  }
}
```

Then in `.env.local`:
```
BASE_RPC_URL=https://base.llamarpc.com
```

## Troubleshooting RPC Issues

### Issue: "Failed to fetch"
**Solution:** RPC is down, try alternative

### Issue: "Timeout"
**Solution:** RPC is slow, try alternative

### Issue: "Invalid response"
**Solution:** RPC is misconfigured, check URL

### Issue: "Rate limited"
**Solution:** You're making too many requests, wait or use different RPC

## RPC Performance Comparison

| RPC Provider | Speed | Reliability | Rate Limit |
|--------------|-------|-------------|------------|
| mainnet.base.org | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium |
| base.llamarpc.com | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High |
| 1rpc.io/base | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | High |
| base-rpc.publicnode.com | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium |

## Best Practices

1. ✅ **Have multiple RPCs configured**
   - Add Base with different RPCs
   - Switch if one is slow

2. ✅ **Test RPC before deploying**
   - Use the test script above
   - Verify it's responding

3. ✅ **Use reliable RPCs for production**
   - LlamaNodes is recommended
   - Official RPC is good backup

4. ✅ **Monitor RPC performance**
   - If transactions are slow, switch RPC
   - Check Base status: https://status.base.org/

5. ✅ **Keep RPC URLs updated**
   - RPCs can change
   - Check chainlist.org periodically

## Quick Reference Card

**Having RPC issues? Try these in order:**

1. Change to LlamaNodes: `https://base.llamarpc.com`
2. Clear MetaMask cache
3. Try 1RPC: `https://1rpc.io/base`
4. Check Base status: https://status.base.org/
5. Use Hardhat instead of Remix

## Additional Resources

- **Chainlist:** https://chainlist.org/chain/8453
- **Base Status:** https://status.base.org/
- **Base Docs:** https://docs.base.org/
- **RPC Comparison:** https://www.alchemy.com/chain-connect/chain/base

---

**Pro Tip:** Bookmark this page and refer to it whenever you have RPC issues!