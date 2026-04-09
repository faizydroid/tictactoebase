# 🔄 Redeploy Contract with Draw Support

## What Changed

The contract now supports recording draws! Here's what was added:

### Contract Updates:
1. ✅ Added `draws` field to Player struct
2. ✅ Added `recordGameResult(uint8 result)` function
3. ✅ Kept `recordAIGame(bool won)` for backward compatibility

### Frontend Updates:
1. ✅ Added `recordGameResult` function to Web3Context
2. ✅ Updated friend game to record all outcomes (win/loss/draw)
3. ✅ Transaction status now shows for draws too

---

## 🚀 How to Redeploy

### Option 1: Using Remix (Recommended)

1. **Open Remix:** https://remix.ethereum.org

2. **Create New File:**
   - Click "+" in File Explorer
   - Name it: `TicTacToe.sol`

3. **Copy Contract:**
   - Open `contracts/TicTacToe.sol` in your project
   - Copy ALL the code
   - Paste into Remix

4. **Compile:**
   - Click "Solidity Compiler" tab (left sidebar)
   - Select compiler version: `0.8.19`
   - Click "Compile TicTacToe.sol"
   - Wait for green checkmark ✅

5. **Deploy:**
   - Click "Deploy & Run Transactions" tab
   - Environment: "Injected Provider - MetaMask"
   - Make sure MetaMask is on Base Mainnet
   - Click "Deploy"
   - Confirm transaction in MetaMask
   - Wait for confirmation

6. **Copy New Address:**
   - After deployment, copy the contract address
   - It will be under "Deployed Contracts"

7. **Update .env.local:**
   - Open `.env.local` in your project
   - Replace the contract address:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=<NEW_ADDRESS_HERE>
   ```

8. **Restart Dev Server:**
   - Stop the server (Ctrl+C)
   - Run: `npm run dev`

---

## 📋 New Function Details

### recordGameResult(uint8 result)

**Parameters:**
- `result`: 0 = loss, 1 = win, 2 = draw

**What it does:**
- Increments `gamesPlayed` by 1
- If result = 1: increments `wins`
- If result = 0: increments `losses`
- If result = 2: increments `draws`

**Usage in code:**
```javascript
// Win
await contract.recordGameResult(1)

// Loss
await contract.recordGameResult(0)

// Draw
await contract.recordGameResult(2)
```

---

## ✅ What Works Now

### Friend Games:
- ✅ Win → Records win on blockchain
- ✅ Loss → Records loss on blockchain
- ✅ Draw → Records draw on blockchain
- ✅ Transaction status shows for all outcomes
- ✅ Stats update correctly

### AI Games:
- ✅ Still uses `recordAIGame(bool won)`
- ✅ Backward compatible
- ✅ No changes needed

---

## 🧪 Testing After Redeployment

1. **Register New Profile:**
   - Use a fresh wallet OR
   - Your existing profile won't work with new contract
   - Register with same username

2. **Test Friend Game:**
   - Create game
   - Join from another browser
   - Play until draw
   - Check transaction status
   - Verify draw is recorded

3. **Check Stats:**
   - Go to leaderboard
   - Your stats should show:
     - Games Played
     - Wins
     - Losses
     - (Draws not shown in UI yet, but recorded on chain)

---

## 🎯 Player Data Structure

### Old Contract:
```solidity
struct Player {
    address wallet;
    string username;
    uint256 gamesPlayed;
    uint256 wins;
    uint256 losses;
    bool isRegistered;
}
```

### New Contract:
```solidity
struct Player {
    address wallet;
    string username;
    uint256 gamesPlayed;
    uint256 wins;
    uint256 losses;
    uint256 draws;  // ← NEW!
    bool isRegistered;
}
```

---

## 📊 Leaderboard Update (Optional)

If you want to show draws in the leaderboard, update `components/Leaderboard.js`:

```javascript
// Add draws to display
<div className="text-xs text-gray-600">
  W: {player.wins} | L: {player.losses} | D: {player.draws}
</div>
```

---

## 🐛 Troubleshooting

### Issue: "Player not registered"

**Cause:** New contract = new player registry

**Fix:**
1. Register again with your wallet
2. Use same username (it's available on new contract)

### Issue: Transaction fails

**Check:**
- Are you on Base Mainnet?
- Do you have enough ETH for gas?
- Is the contract address correct in `.env.local`?

### Issue: Stats don't update

**Fix:**
- Refresh the page
- Check blockchain explorer to verify transaction
- Make sure you're using the new contract address

---

## 🎉 Benefits

### Before:
- ❌ Draws not recorded
- ❌ No transaction for draws
- ❌ Stats incomplete

### After:
- ✅ All outcomes recorded
- ✅ Transaction for every game
- ✅ Complete stats tracking
- ✅ Better game history

---

## 🚀 Ready to Deploy!

1. Copy contract code to Remix
2. Compile with 0.8.19
3. Deploy to Base Mainnet
4. Update `.env.local`
5. Restart server
6. Test with friend game!

Your game will now record ALL outcomes on the blockchain! 🎮

