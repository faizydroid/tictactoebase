const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying TicTacToe contract to ${network}...`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Deploying from account: ${deployer.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${hre.ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error("\n❌ Error: Deployer account has no ETH!");
    console.log("\n💡 To get testnet ETH for Base Sepolia:");
    console.log("   1. Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
    console.log("   2. Or bridge from Ethereum Sepolia: https://bridge.base.org/");
    process.exit(1);
  }

  // Deploy contract
  console.log("\n⏳ Deploying contract...");
  const TicTacToe = await hre.ethers.getContractFactory("TicTacToe");
  const ticTacToe = await TicTacToe.deploy();

  await ticTacToe.waitForDeployment();

  const address = await ticTacToe.getAddress();
  console.log("\n✅ TicTacToe deployed successfully!");
  console.log(`📄 Contract address: ${address}`);

  // Save the contract ABI and address
  const fs = require('fs');
  const contractsDir = __dirname + "/../contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const contractData = {
    address: address,
    network: network,
    chainId: hre.network.config.chainId,
    abi: JSON.parse(ticTacToe.interface.formatJson())
  };

  fs.writeFileSync(
    contractsDir + "/TicTacToe.json",
    JSON.stringify(contractData, null, 2)
  );

  console.log("💾 Contract ABI saved to contracts/TicTacToe.json");

  // Network-specific information
  if (network === "base") {
    console.log(`\n🔍 View on BaseScan: https://basescan.org/address/${address}`);
  } else if (network === "baseSepolia") {
    console.log(`\n🔍 View on BaseScan: https://sepolia.basescan.org/address/${address}`);
  }

  console.log("\n📝 Next steps:");
  console.log(`   1. Update .env.local with: NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`   2. Verify contract (optional): npx hardhat verify --network ${network} ${address}`);
  console.log(`   3. Start your app: npm run dev`);

  // Wait for block confirmations before verification
  if (network !== "localhost" && network !== "hardhat") {
    console.log("\n⏳ Waiting for block confirmations...");
    await ticTacToe.deploymentTransaction().wait(5);
    console.log("✅ Confirmed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });