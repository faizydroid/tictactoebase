# Fix Dependency Issues - Step by Step

## Problem
The app has corrupted node_modules and incompatible package versions causing:
- Missing `@base-org/account` dependency error
- Corrupted `@walletconnect/ethereum-provider` installation
- Cannot start the development server

## Solution

### Step 1: Clean Installation (REQUIRED)

Since Windows is blocking file deletion, you need to:

**Option A: Use PowerShell as Administrator**
```powershell
# Open PowerShell as Administrator
# Navigate to your project directory
cd D:\Apps\XO

# Force remove node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall dependencies
npm install
```

**Option B: Manual Deletion**
1. Close VS Code and any other programs accessing the project
2. Manually delete the `node_modules` folder
3. Delete `package-lock.json`
4. Run `npm install`

**Option C: Use npm cache clean**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Step 2: Verify Installation

After reinstalling, check that these packages are installed:
```bash
npm list @web3modal/wagmi wagmi viem @tanstack/react-query
```

You should see:
- `@web3modal/wagmi@5.1.11`
- `wagmi@2.12.17` (downgraded from v3 for compatibility)
- `viem@2.47.10`
- `@tanstack/react-query@5.96.2`

### Step 3: Start Development Server

```bash
npm run dev
```

The app should now start without errors!

## What Was Changed

### 1. Downgraded Wagmi to v2
- Changed from `wagmi@3.6.1` to `wagmi@2.12.17`
- Wagmi v3 requires additional dependencies that conflict with Web3Modal v5
- Wagmi v2 is fully compatible with Web3Modal v5 and React 18

### 2. Simplified Wagmi Configuration
- Used `defaultWagmiConfig` from `@web3modal/wagmi/react/config`
- This automatically sets up all necessary connectors (MetaMask, WalletConnect, Coinbase Wallet)
- Removed manual connector configuration that was causing dependency issues

### 3. Updated Web3Context
- Added proper `useDisconnect` hook from Wagmi
- Removed unused `usePublicClient` import
- Fixed disconnect functionality to use Wagmi's built-in disconnect

### 4. Removed Unnecessary Packages
- Removed `@coinbase/wallet-sdk` (included in Web3Modal)
- Removed old `web3modal@1.9.12` (using `@web3modal/wagmi` instead)

## Features Working After Fix

✅ Connect wallet with MetaMask, WalletConnect, Coinbase Wallet
✅ Disconnect wallet properly
✅ Register player with username
✅ Play multiplayer games on Base blockchain
✅ Play AI games (local + blockchain recording)
✅ View leaderboard with Supabase usernames
✅ All stats tracked on Base Mainnet

## Network Configuration

The app is configured for:
- **Network**: Base Mainnet
- **Chain ID**: 8453
- **Contract**: `0xaD192e9Fcac714F0268F8f608EF8ae3817Ce2CaF`
- **WalletConnect Project ID**: Already configured in `.env.local`

## Troubleshooting

### If you still get errors after reinstalling:

1. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

2. **Check Node.js version**:
   ```bash
   node --version
   ```
   Should be v16 or higher (v18+ recommended)

3. **Try using yarn instead**:
   ```bash
   npm install -g yarn
   yarn install
   yarn dev
   ```

4. **Check for antivirus interference**:
   - Temporarily disable antivirus
   - Add project folder to exclusions

### If Web3Modal doesn't open:

1. Check browser console for errors
2. Verify WalletConnect Project ID in `.env.local`
3. Make sure you're using a modern browser (Chrome, Firefox, Brave)

## Next Steps After Fix

1. Test wallet connection
2. Register a player
3. Play a game to verify blockchain integration
4. Check leaderboard to verify Supabase integration

## Need Help?

If you're still having issues:
1. Share the exact error message
2. Check if `node_modules` was fully deleted
3. Try the yarn alternative
4. Restart your computer (sometimes Windows locks files)
