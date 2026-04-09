# WalletConnect Setup Guide

This guide will help you set up WalletConnect for your TicTacToe game.

## Step 1: Create a WalletConnect Project

1. Go to [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up or log in
3. Click "Create New Project"
4. Fill in:
   - Project name: `TicTacToe Arena`
   - Homepage URL: Your app URL (or `http://localhost:3001` for development)
5. Click "Create"

## Step 2: Get Your Project ID

1. In your project dashboard, you'll see your **Project ID**
2. Copy this ID (it looks like: `a1b2c3d4e5f6...`)

## Step 3: Update Environment Variables

1. Open your `.env.local` file
2. Replace `YOUR_PROJECT_ID_HERE` with your actual Project ID:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
```

3. Save the file

## Step 4: Restart Your Development Server

```bash
npm run dev
```

## Features

With Wagmi and WalletConnect, your app now supports:

- **MetaMask** - Browser extension wallet
- **WalletConnect** - Mobile wallet connection via QR code
- **Coinbase Wallet** - Coinbase's wallet
- **Rainbow** - Popular mobile wallet
- **Trust Wallet** - Multi-chain wallet
- And many more wallets!

## Benefits

- Better UX with modal wallet selector
- Support for multiple wallets
- Mobile wallet support via QR codes
- Automatic reconnection
- Network switching
- Better error handling

## Troubleshooting

### "Invalid Project ID" Error
- Verify your Project ID is correct in `.env.local`
- Make sure there are no extra spaces
- Restart your development server

### Wallet Not Connecting
- Check that you're on the correct network (Base)
- Try refreshing the page
- Clear browser cache and try again

### Modal Not Appearing
- Check browser console for errors
- Verify all packages are installed correctly
- Make sure you restarted the dev server after adding the Project ID
