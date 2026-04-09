#!/bin/bash

echo "🎮 Base Tic-Tac-Toe Setup Script"
echo "================================"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local already exists"
else
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local and add your PRIVATE_KEY"
    echo ""
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Get Base Sepolia ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
echo "   2. Add your PRIVATE_KEY to .env.local"
echo "   3. Deploy: npx hardhat run scripts/deploy-base.js --network baseSepolia"
echo "   4. Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local"
echo "   5. Start app: npm run dev"
echo ""