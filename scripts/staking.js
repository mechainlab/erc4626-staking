const aleo_address = "0x9e1DC09d9d7C02C541F82227DddC1CabC9E94858";
const Token_Artifact = require("../artifacts/contracts/Token.sol/AleoToken.json");
const stakingHub_address = "0x27F6b66D37C61E3627b872935c302d319d12AC82";
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
  let privateKey = "0x315bdde188acc16b06b41b3ccb06da359c2bbb5a60072b61aa13f907aaaeb782";
  let customHttpProvider = new ethers.providers.JsonRpcProvider(
    "https://polygon-mumbai.g.alchemy.com/v2/YbE4U9U8b3M74_Un2wTDK83R0M2W1Ksf"
  );
  const signer = new ethers.Wallet(privateKey, customHttpProvider);
  console.log(signer.address);

  ///deposit
  let token = new ethers.Contract(aleo_address, Token_Artifact.abi, signer);
  console.log("approve...");
  // await token.approve(stakingHub_address, ethers.utils.parseUnits("10", 6), overrides);

  let StakingHub = new ethers.Contract(
    stakingHub_address,
    StakingHubArtifact.abi,
    signer
  );
  // let deposit = await StakingHub.deposit(
  //   ethers.utils.parseUnits("10", 6),
  //   signer.address,
  //   overrides
  // );
  // console.log("deposit:" + deposit.hash);

  // await new Promise((resolve, reject) => {
  //   setTimeout(function () {
  //     resolve('time')
  //   }, 1000)
  // })
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
