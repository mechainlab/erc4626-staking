const aleo_address = "0x8bcEEE23a628C8bc98df37941Ad24bD950F1853F";
const Token_Artifact = require("../artifacts/contracts/Token.sol/AleoToken.json");
const stakingHub_address = "0x00BF3DEeEeD0F7cdDdEe197574B82b845013fDF7";
const StakingHubArtifact = require("../artifacts/contracts/StakingHub.sol/StakingHub.json");

const overrides = {
  gasLimit: 15000000,
  gasPrice: 10 * 10 ** 9,
};

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  ///Prepare deployer
  let privateKey = "0x537682a041dc2a904573b6045bfbc9442940868b6aabaaa64bb4036677feb69a";
  let customHttpProvider = new ethers.providers.JsonRpcProvider(
    "http://47.242.179.164:9933"
  );
  const signer = new ethers.Wallet(privateKey, customHttpProvider);
  console.log(signer.address);

  ///deposit
  let token = new ethers.Contract(aleo_address, Token_Artifact.abi, signer);
  console.log("approve...");
  await token.approve(stakingHub_address, ethers.utils.parseUnits("1", 6), overrides);

  let StakingHub = new ethers.Contract(
    stakingHub_address,
    StakingHubArtifact.abi,
    signer
  );
  let deposit = await StakingHub.deposit(
    ethers.utils.parseUnits("1", 6),
    signer.address,
    overrides
  );
  console.log("deposit:" + deposit.hash);

  await new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('time')
    }, 3000)
  })
  let receipt = await customHttpProvider.getTransactionReceipt(deposit.hash);
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
