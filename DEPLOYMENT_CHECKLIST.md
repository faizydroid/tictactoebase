# 📋 Base Deployment Checklist

## Pre-Deployment

- [ ] MetaMask installed
- [ ] Base Sepolia network added to MetaMask
- [ ] Got testnet ETH from faucet
- [ ] Private key exported from MetaMask
- [ ] `.env.local` file created with PRIVATE_KEY

## Deployment

- [ ] Run: `npx hardhat compile`
- [ ] Run: `npx hardhat run scripts/deploy-base.js --network baseSepolia`
- [ ] Copy contract address from output
- [ ] Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`
- [ ] Save contract address for future reference

## Testing

- [ ] Run: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Connect MetaMask to Base Sepolia
- [ ] Register a username
- [ ] Check leaderboard displays
- [ ] Create a test game
- [ ] Make moves in the game
- [ ] Verify game completion and stats update

## Optional

- [ ] Get BaseScan API key
- [ ] Verify contract on BaseScan
- [ ] Test with multiple accounts
- [ ] Share with friends for multiplayer testing

## Production (When Ready)

- [ ] All features tested on testnet
- [ ] Get real ETH on Base Mainnet
- [ ] Deploy to Base Mainnet
- [ ] Update contract address
- [ ] Verify on BaseScan
- [ ] Announce to users!

---

**Current Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete