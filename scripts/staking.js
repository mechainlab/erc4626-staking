const aleo_address = "0x99aBe9699C4Ce8dd8C9DaE5f5ce36F2263c0b8E1";
const Token_Artifact = require("../artifacts/contracts/Token.sol/AleoToken.json");
const stakingHub_address = "0x8bcEEE23a628C8bc98df37941Ad24bD950F1853F";
const StakingHubArtifact = require("../artifacts/contracts/StakingHub.sol/StakingHub.json");

const overrides = {
  gasLimit: 15000000,
  gasPrice: 10 * 10 ** 9,
};

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  let privateKey = "0xde9be858da4a475276426320d5e9262ecfc3ba460bfac56360bfa6c4c28b4ee0";
  let customHttpProvider = new ethers.providers.JsonRpcProvider(
    "http://47.242.179.164:9933"
  );
  const signer = new ethers.Wallet(privateKey, customHttpProvider);
  console.log(signer.address);

  let token = new ethers.Contract(aleo_address, Token_Artifact.abi, deployer);
  await token.approve(stakingHub_address, 1000);

  let StakingHub = new ethers.Contract(
    stakingHub_address,
    StakingHubArtifact.abi,
    deployer
  );
  let deposit = await StakingHub.deposit(
    1000,
    signer.address,
    overrides
  );
  console.log("deposit:" + deposit.hash);

  await new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('time')
    }, 3000)
  })


  let staking_balance = await StakingHub.reviewAssets(signer.address);
  console.log("user's staking balance: " + staking_balance);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
