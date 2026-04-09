# Why Do I Need to Re-Register?

## The Situation

You already have a wallet and username, but the app is asking you to register again.

**This is CORRECT behavior!** Here's why:

---

## What Happened

### Old Contract:
- Address: `0xd73E77c84Be30e54A7E08Aaa19A7fA7ac2D45C61`
- Had your username registered
- Didn't support draws

### New Contract:
- Address: `0x2Ce6EA5243B37B558920B501510A4595808b43cF`
- Supports draws (win/loss/draw)
- Is a completely NEW contract
- Doesn't have your username yet

---

## Why Re-Register?

Smart contracts are immutable (can't be changed). When we added draw support, we had to:
1. Deploy a NEW contract
2. Update the app to use the new contract address

**Your username exists in two places:**
1. ✅ Supabase database (still there!)
2. ❌ Old blockchain contract (not on new one)

**You need to register on the NEW contract** so your username is on the blockchain again.

---

## What You Need to Do

### Step 1: Click "Re-Register on New Contract"
The app already filled in your existing username for you!

### Step 2: Approve the Transaction
MetaMask will pop up asking you to approve. This is a one-time blockchain transaction.

### Step 3: Done!
After the transaction confirms, you're all set! You won't need to do this again.

---

## What You Get

### After Re-Registering:
- ✅ Your username on the new contract
- ✅ Fresh stats (starts at 0)
- ✅ Draw support in all games
- ✅ All new features

### Your Old Stats:
- Still on the old contract
- Can't be transferred (blockchain is immutable)
- Fresh start on new contract

---

## Cost

**Gas Fee:** Small amount of ETH for the transaction
- Usually < $0.50 on Base Mainnet
- One-time cost
- Required for blockchain registration

---

## Is This Normal?

**YES!** This is standard when:
- Contracts are upgraded
- New features are added
- Bugs are fixed

**Other games do this too:**
- When they add new features
- When they fix critical bugs
- When they improve the contract

---

## Your Username is Safe

**Don't worry!** Your username is:
- ✅ Still in Supabase database
- ✅ Pre-filled in the form
- ✅ Reserved for you
- ✅ Same as before

You're just registering it on the new contract.

---

## Benefits of New Contract

### What You Get:
1. ✅ Draw support (records draws on blockchain)
2. ✅ Better stats tracking
3. ✅ `recordGameResult` function (win/loss/draw)
4. ✅ More accurate game history

### Worth It?
**Absolutely!** The new features make the game much better.

---

## Quick Summary

**Why?** New contract = need to register again
**Cost?** Small gas fee (< $0.50)
**Username?** Same as before (pre-filled)
**Stats?** Fresh start
**Worth it?** Yes! New features are great

---

## Just Do This:

1. Click "Re-Register on New Contract"
2. Approve in MetaMask
3. Wait for confirmation
4. Start playing!

That's it! One-time thing, then you're good to go! 🎮

