
const overrides = {
  gasLimit: 15000000,
  gasPrice: 10 * 10 ** 9,
};

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {

  ///prepare deployer
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying contracts with the account:",
    await deployer.getAddress()
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());


  ///deploy AleoToken
  const AleoToken = await ethers.getContractFactory("AleoToken");
  const aleoToken = await AleoToken.deploy(BigNumber.from(10 ** 12).mul(BigNumber.from(10 ** 6))); //totalSupply = $10**12 * 10**6
  await aleoToken.deployed();
  console.log("aleoToken address:", aleoToken.address);

  let deployer_balance = await aleoToken.balanceOf(deployer.getAddress());
  console.log("deployer_balance:" + deployer_balance);


  ///delploy StakingHub
  const StakingHub = await ethers.getContractFactory("StakingHub");
  const stakingHub = await StakingHub.deploy(aleoToken.address, aleoToken.address, 500);
  await stakingHub.deployed();
  console.log("stakingHub address:", stakingHub.address);

  ///prepare fund of StakingHub
  // await aleoToken.transfer(stakingHub.address, 100000);
  await aleoToken.approve(stakingHub.address, 100 * 10 ** 6, overrides);
  await stakingHub.prepareRewardVault(100 * 10 ** 6, overrides);

  await new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('time')
    }, 3000)
  })

  let reviewRewardVault = await stakingHub.reviewRewardVault();
  console.log("reviewRewardVault:" + reviewRewardVault);

}




main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
