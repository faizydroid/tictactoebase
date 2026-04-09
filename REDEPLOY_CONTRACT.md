# Redeploy Contract with AI Game Function

## Issue
The current deployed contract at `0xaD192e9Fcac714F0268F8f608EF8ae3817Ce2CaF` doesn't have the `recordAIGame` function, so AI game results aren't being recorded on the blockchain.

## Solution
You need to redeploy the contract with the updated code that includes the `recordAIGame` function.

## Contract Code
The contract in `contracts/TicTacToe.sol` already has the `recordAIGame` function:

```solidity
// Record AI game result (no opponent needed)
function recordAIGame(bool won) external {
    require(players[msg.sender].isRegistered, "Player not registered");
    
    players[msg.sender].gamesPlayed++;
    
    if (won) {
        players[msg.sender].wins++;
    } else {
        players[msg.sender].losses++;
    }
}
```

## Deployment Steps

### Option 1: Using Remix (Recommended)

1. **Open Remix IDE**: https://remix.ethereum.org

2. **Create New File**: `TicTacToe.sol`

3. **Copy Contract Code**: Copy the entire content from `contracts/TicTacToe.sol`

4. **Compile**:
   - Click "Solidity Compiler" tab
   - Select compiler version: `0.8.19`
   - Click "Compile TicTacToe.sol"

5. **Deploy to Base Mainnet**:
   - Click "Deploy & Run Transactions" tab
   - Environment: Select "Injected Provider - MetaMask"
   - Make sure MetaMask is connected to **Base Mainnet**
   - Network: Base (Chain ID: 8453)
   - Click "Deploy"
   - Confirm transaction in MetaMask

6. **Copy New Contract Address**:
   - After deployment, copy the new contract address
   - Update `.env.local`:
     ```
     NEXT_PUBLIC_CONTRACT_ADDRESS=<NEW_CONTRACT_ADDRESS>
     ```

7. **Verify Contract** (Optional but recommended):
   - Go to https://basescan.org
   - Search for your contract address
   - Click "Verify and Publish"
   - Follow the verification steps

### Option 2: Using Hardhat

1. **Compile Contract**:
   ```bash
   npm run compile
   ```

2. **Deploy to Base**:
   ```bash
   npx hardhat run scripts/deploy-base.js --network base
   ```

3. **Update `.env.local`** with the new contract address

## After Deployment

1. **Update Environment Variable**:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=<NEW_CONTRACT_ADDRESS>
   ```

2. **Restart Development Server**:
   ```bash
   npm run dev
   ```

3. **Re-register Your Account**:
   - Since it's a new contract, you'll need to register again
   - Connect wallet
   - Register with your username

4. **Test AI Game**:
   - Play an AI game
   - Win or lose
   - You should see a MetaMask transaction popup
   - Confirm the transaction
   - Your stats should update on the blockchain

## Important Notes

- **New Contract = Fresh Start**: All previous game data will be on the old contract
- **Gas Fees**: You'll need ETH on Base Mainnet for deployment (~$0.50-$2)
- **Re-registration**: All users need to register again on the new contract
- **Update Frontend**: Make sure to update the contract address in `.env.local`

## Verification

After deployment, verify the `recordAIGame` function exists:

1. Go to BaseScan: https://basescan.org/address/<YOUR_CONTRACT_ADDRESS>
2. Click "Contract" tab
3. Click "Read Contract"
4. You should see all functions including `recordAIGame`

## Current Contract Info

- **Old Contract**: `0xaD192e9Fcac714F0268F8f608EF8ae3817Ce2CaF`
- **Network**: Base Mainnet (Chain ID: 8453)
- **Issue**: Missing `recordAIGame` function

## New Contract Will Have

✅ All existing functions (registerPlayer, createGame, makeMove, etc.)
✅ `recordAIGame(bool won)` function for AI game results
✅ Same game logic and leaderboard functionality

---

**Need Help?**
- Make sure you have ETH on Base Mainnet for gas fees
- Use Remix for easiest deployment
- Test on Base Sepolia testnet first if you want to practice
