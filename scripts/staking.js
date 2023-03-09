const aleo_address = "0x89f3205387fcDCCEfE24a85923Dc458Fe2723B31";
const Token_Artifact = require("../artifacts/contracts/Token.sol/AleoToken.json");
const stakingHub_address = "0xFD90eA2DaD3a059aaaEAfAf5049047b835f98913";
const StakingHubArtifact = require("../artifacts/contracts/StakingHub.sol/StakingHub.json");

const overrides = {
  gasLimit: 15000000,
  gasPrice: 10 * 10 ** 9,
};

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  ///Prepare deployer
  let privateKey = "0x8d35ea35953931a53fa05da3f396be651102514b2eac740911cb9d0aca0f8e61";
  let customHttpProvider = new ethers.providers.JsonRpcProvider(
    "http://47.242.179.164:9933"
  );
  const signer = new ethers.Wallet(privateKey, customHttpProvider);
  console.log(signer.address);

  ///deposit
  let token = new ethers.Contract(aleo_address, Token_Artifact.abi, signer);
  console.log("approve...");
  await token.approve(stakingHub_address, 100 * 10 ** 6, overrides);

  let StakingHub = new ethers.Contract(
    stakingHub_address,
    StakingHubArtifact.abi,
    signer
  );
  let deposit = await StakingHub.deposit(
    100 * 10 ** 6,
    signer.address,
    overrides
  );
  console.log("deposit:" + deposit.hash);

  await new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('time')
    }, 3000)
  })

  ///reviewAssets
  let reviewAssets = await StakingHub.reviewAssets(signer.address);
  console.log("user's staking balance: " + reviewAssets);

  for (let i = 0; i < 10; i++) {
    let staking_reward = await StakingHub.reviewReward(signer.address);
    console.log("user's staking reward: " + staking_reward);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
