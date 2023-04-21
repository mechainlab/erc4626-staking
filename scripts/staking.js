const aleo_address = "0xba9AD610eD484d690C4d205e13E21BB709215437";
const Token_Artifact = require("../artifacts/contracts/Token.sol/AleoToken.json");
const stakingHub_address = "0xa8c5B5E6b05589976887f9BCd37E6bbdDd8cd6b5";
const StakingHubArtifact = require("../artifacts/contracts/StakingHub.sol/StakingHub.json");
const { BigNumber } = require("ethers")

const overrides = {
  gasLimit: 15000000,
  gasPrice: 10 * 10 ** 9
};

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  ///Prepare deployer
  //0xa1265c600f11166563cfc93f5f99b4a4a976201026046962fd700abf65707ac9
  let privateKey = "";
  let customHttpProvider = new ethers.providers.JsonRpcProvider(
    "https://eth-sepolia.g.alchemy.com/v2/3-VefB24BzwJ9dnkb9sKABundlDLZrRj"
  );
  const signer = new ethers.Wallet(privateKey, customHttpProvider);
  console.log(signer.address);

  ///deposit
  let token = new ethers.Contract(aleo_address, Token_Artifact.abi, signer);
  console.log("approve...");
  await token.approve(stakingHub_address, ethers.utils.parseUnits("10", 6));

  let StakingHub = new ethers.Contract(
    stakingHub_address,
    StakingHubArtifact.abi,
    signer
  );
  let deposit = await StakingHub.deposit(
    ethers.utils.parseUnits("10", 6),
    signer.address
  );
  console.log("deposit:" + deposit.hash);

  await new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('time')
    }, 6000)
  })
  // let receipt = await customHttpProvider.getTransactionReceipt(deposit.hash);
  // console.log(receipt);

  ///reviewAssets
  let reviewAssets = await StakingHub.reviewAssets(signer.address);
  console.log("user's staking balance: " + reviewAssets);

  // for (let i = 0; i < 10; i++) {
  //   await new Promise((resolve, reject) => {
  //     setTimeout(function () {
  //       resolve('time')
  //     }, 2000)
  //   })
  //   let staking_reward = await StakingHub.reviewReward(signer.address);
  //   console.log("user's staking reward: " + staking_reward);
  // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
