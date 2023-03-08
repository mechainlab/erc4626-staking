const usdt_address = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';


// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    await deployer.getAddress()
  );
  
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const AD3Hub = await ethers.getContractFactory("AD3Hub");
  const ad3Hub = await AD3Hub.deploy();
  await ad3Hub.deployed();
  console.log("ad3Hub address:", ad3Hub.address);

  const USDT = await ethers.getContractFactory("TetherToken");
  const token = await USDT.deploy(10 ** 12); //totalSupply = $10 ** 6
  await token.deployed();
  console.log("token address:", token.address);

  let balance = await token.balanceOf(deployer.getAddress());
  console.log("balance:" + balance);

  const Campaign = await ethers.getContractFactory("Campaign");
  const campaign = await Campaign.deploy();
  await campaign.deployed();
  console.log("campaignImpl address:", campaign.address);

  await ad3Hub.setCampaignImpl(campaign.address);

  // await ad3Hub.setPaymentToken(token.address);
  
  await ad3Hub.setTrustedSigner(deployer.address);

}




main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
