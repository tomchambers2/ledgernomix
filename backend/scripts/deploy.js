// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");
var path = require("path");

const { deployments } = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Game = await hre.ethers.getContractFactory("Game");
  const game = await Game.deploy();

  await game.deployed();

  var from = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "Game.sol",
    "Game.json"
  );
  var to = path.join(
    __dirname,
    "..",
    "..",
    "app",
    "src",
    "contracts",
    "Game.json"
  );

  fs.copyFileSync(from, to, (err) => {
    if (err) throw err;
    console.log("copied artifact");
  });

  console.log("game deployed to:", game.address);

  fs.writeFileSync(
    path.join(__dirname, "..", "..", "app", "src", "config.js"),
    `export const config = { gameContract: { address: "${game.address}" } };`
  );

  const artifact = await deployments.getArtifact("Game");

  // // File destination.txt will be created or overwritten by default.
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
