# 🐛 Debug Transaction Issue

## How to Debug

### Step 1: Open Browser Console
1. Press F12
2. Go to Console tab
3. Play a game until it ends
4. Look for these messages:

### Step 2: Check the Logs

You should see:
```
🎮 Recording transaction for result: Loss (or Win/Draw)
📊 Contract available: true/false
📊 Player data: {username: "...", ...}
📊 Account: 0x...
```

### Step 3: Identify the Issue

**If Contract available: false**
- Problem: Contract not initialized
- Solution: Reconnect wallet

**If Player data: null**
- Problem: Player data not loaded
- Solution: Refresh page

**If Account: undefined**
- Problem: Wallet not connected
- Solution: Connect wallet

**If you see: "❌ Player not registered on blockchain contract"**
- Problem: Auto-registration failed
- Solution: Check if you approved the registration transaction

**If you see: "❌ recordGameResult returned false"**
- Problem: Transaction failed
- Solution: Check MetaMask for rejected transaction

---

## Common Issues

### Issue 1: Contract Not Available
**Symptoms:**
- "No transaction recorded"
- Console shows: "Contract available: false"

**Fix:**
1. Disconnect wallet
2. Reconnect wallet
3. Try again

### Issue 2: Player Data Not Loaded
**Symptoms:**
- "No transaction recorded"
- Console shows: "Player data: null"

**Fix:**
1. Refresh the page
2. Make sure you're logged in
3. Try again

### Issue 3: Transaction Rejected
**Symptoms:**
- MetaMask popup appeared
- You clicked "Reject"
- "No transaction recorded"

**Fix:**
1. Play another game
2. When MetaMask pops up, click "Confirm"

### Issue 4: Not Registered on Blockchain
**Symptoms:**
- Two MetaMask popups (first game)
- Rejected the first one
- "No transaction recorded"

**Fix:**
1. Play another game
2. Approve BOTH transactions:
   - First: Registration
   - Second: Game result

---

## Quick Fix

If nothing works:
1. Disconnect wallet
2. Refresh page
3. Connect wallet
4. Play a game
5. Approve all MetaMask popups

---

## What to Share

If still not working, share these from console:
- Contract available: ?
- Player data: ?
- Account: ?
- Any error messages

This will help identify the exact issue!
