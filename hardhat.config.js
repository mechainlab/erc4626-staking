require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });
require("hardhat-gas-reporter");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.

const { GOERLI_PRIVATE_KEY, ALCHEMY_PROJECT_ID, POLYGON_TEST_PRIVATE_KEY, POLYGON_MAINNEI_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.2" }
    ]
  },
  networks: {
    hardhat: {
      chainId: 1337 // We set 1337 to make interacting with MetaMask simpler
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_PROJECT_ID}`,
      accounts: ['0x8d35ea35953931a53fa05da3f396be651102514b2eac740911cb9d0aca0f8e61']
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/YbE4U9U8b3M74_Un2wTDK83R0M2W1Ksf`,
      accounts: ['0x315bdde188acc16b06b41b3ccb06da359c2bbb5a60072b61aa13f907aaaeb782']
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/bvL_Fraw7yQecq_blueU9WKVlKVuOyg4RJxK`,
      accounts: [POLYGON_MAINNEI_PRIVATE_KEY]
    },
    ethermind: {
      url: `http://47.242.179.164:9933`,
      accounts: ['0x193144a9aa67b535d16d37e07dcf6c7ca2cec48d2859bb880a117f56633a321e']
    },
    frondier: {
      url: `http://8.210.44.55:9933`,
      accounts: ['0x1667b42e9169b4a17fd62ebf339e449fcd1464b1db58d8e0518416cc58ec6d30']
    }
  },
  gasReporter: {
    enabled: false,
    gasPrice: 10,
    currency: 'USD',
    token: "ETH"
  }
};
