const hre = require("hardhat");

async function main() {
  console.log("Deploying TicTacToe contract...");

  const TicTacToe = await hre.ethers.getContractFactory("TicTacToe");
  const ticTacToe = await TicTacToe.deploy();

  await ticTacToe.waitForDeployment();

  const address = await ticTacToe.getAddress();
  console.log("TicTacToe deployed to:", address);

  // Save the contract ABI and address
  const fs = require('fs');
  const contractsDir = __dirname + "/../contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/TicTacToe.json",
    JSON.stringify({
      address: address,
      abi: ticTacToe.interface.format('json')
    }, null, 2)
  );

  console.log("Contract ABI saved to contracts/TicTacToe.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });