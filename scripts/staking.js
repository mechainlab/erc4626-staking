const aleo_address = "0x72e5D384E49Bb1141b7710147fB2c34d781060d8";
const Token_Artifact = require("../artifacts/contracts/Token.sol/AleoToken.json");
const stakingHub_address = "0xEc2Db6A2B6A99448f30D224Af358c9f93778bF7a";
const StakingHubArtifact = require("../artifacts/contracts/StakingHub.sol/StakingHub.json");

const overrides = {
  gasLimit: 15000000,
  gasPrice: 10 * 10 ** 9,
};

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  let privateKey = "0x8d35ea35953931a53fa05da3f396be651102514b2eac740911cb9d0aca0f8e61";
  let customHttpProvider = new ethers.providers.JsonRpcProvider(
    "http://47.242.179.164:9933"
  );
  const signer = new ethers.Wallet(privateKey, customHttpProvider);
  console.log(signer.address);

  // let token = new ethers.Contract(aleo_address, Token_Artifact.abi, signer);
  // console.log("approve1...");
  // await token.approve(stakingHub_address, 100 * 10 ** 6, overrides);
  // console.log("approve2...");

  let StakingHub = new ethers.Contract(
    stakingHub_address,
    StakingHubArtifact.abi,
    signer
  );
  // let deposit = await StakingHub.deposit(
  //   100 * 10 ** 6,
  //   signer.address,
  //   overrides
  // );
  // console.log("deposit:" + deposit.hash);

  // await new Promise((resolve, reject) => {
  //   setTimeout(function () {
  //     resolve('time')
  //   }, 3000)
  // })


  // let staking_balance = await StakingHub.reviewReward(signer.address);
  // console.log("user's staking balance: " + staking_balance);

  let staking_reward = await StakingHub.reviewReward(signer.address);
  console.log("user's staking reward: " + staking_reward);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
