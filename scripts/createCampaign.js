const usdt_address = "0xe15a3dF7DcC7E26dA79B2213f59A50ac53ea4f07";
const Token_Artifact = require("../artifacts/contracts/Token.sol/TetherToken.json");
const Campaign_Artifact = require("../artifacts/contracts/Campaign.sol/Campaign.json");
const AD3Hub_Artifact = require("../artifacts/contracts/AD3Hub.sol/AD3Hub.json");
const ad3hub_address = "0x65A6da30DA6F59f1122f1c300868090f0AC1a1Dc";

const overrides = {
  gasLimit: 15000000,
  gasPrice: 10 * 10 ** 9,
};

// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  let token = new ethers.Contract(usdt_address, Token_Artifact.abi, deployer);
  await token.approve(ad3hub_address, 20000000);

  let AD3Hub = new ethers.Contract(
    ad3hub_address,
    AD3Hub_Artifact.abi,
    deployer
  );
  let createCampaign = await AD3Hub.createCampaign(
    10000000,
    10000000,
    usdt_address,
    usdt_address,
    overrides
  );
  console.log("createCampaign:" + createCampaign.hash);

  await new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve('time')
    }, 3000)
  })


  let campaignAddress = await AD3Hub.getCampaignAddress(deployer.address, 1);
  console.log("campaignAddress: " + campaignAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
