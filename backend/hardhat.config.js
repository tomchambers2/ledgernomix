require("hardhat-deploy");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  // gasReporter: {
  //   currency: "GBP",
  //   gasPrice: 21,
  // },
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545",
    },
    hardhat: {
      // url: "http://127.0.0.1:8545",
    },
    // dai: {
    //   url: "https://dai.poa.network",
    //   chainId: 100,
    //   accounts: [process.env.XDAI_PRIVATE_KEY],
    // },
  },
  solidity: "0.8.1",
};
