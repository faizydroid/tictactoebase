# Quick Start Guide 🚀

## Fix the App in 3 Steps

### Step 1: Clean Install (Choose One)

**Option A: PowerShell Script (Recommended)**
```powershell
# Right-click PowerShell → Run as Administrator
.\cleanup.ps1
```

**Option B: Git Bash Script**
```bash
chmod +x cleanup.sh
./cleanup.sh
```

**Option C: Manual Commands**
```bash
# PowerShell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install

# Git Bash / CMD
rm -rf node_modules package-lock.json
npm install
```

### Step 2: Start the App
```bash
npm run dev
```

### Step 3: Test
1. Open `http://localhost:3000`
2. Click "Connect Wallet"
3. Select your wallet (MetaMask, Coinbase, etc.)
4. Register with a username
5. Play!

## What's New?

✅ Multi-wallet support (MetaMask, Coinbase, WalletConnect)
✅ Beautiful wallet selection modal
✅ Proper disconnect functionality
✅ Better error handling
✅ Mobile wallet support

## Common Issues

### "Cannot find module" error
→ Run cleanup script or manually delete `node_modules`

### Web3Modal doesn't open
→ Check browser console, try different browser

### "Player not registered" error
→ Register after connecting wallet

## Files to Read

- `MIGRATION_COMPLETE.md` - Full migration details
- `FIX_DEPENDENCIES.md` - Detailed troubleshooting
- `WALLETCONNECT_SETUP.md` - WalletConnect info

## Need Help?

1. Check browser console for errors
2. Verify `.env.local` has all variables
3. Make sure wallet is on Base Mainnet
4. Try clearing browser cache

---

**TL;DR**: Run `.\cleanup.ps1` (PowerShell) or `./cleanup.sh` (Bash), then `npm run dev`
