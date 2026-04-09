const hre = require("hardhat");

async function main() {
  console.log("Available Hardhat Test Accounts:");
  console.log("================================");
  
  const signers = await hre.ethers.getSigners();
  
  signers.forEach((signer, i) => {
    console.log(`Account ${i}: ${signer.address}`);
  });
  
  console.log("\n🚀 Contract deployed from Account 0");
  console.log("💡 Use any of these accounts in MetaMask for testing");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });