const stakingHub_address = "0x00BF3DEeEeD0F7cdDdEe197574B82b845013fDF7";
const StakingHubArtifact = require("../artifacts/contracts/StakingHub.sol/StakingHub.json");

const newOwner = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';


// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    await deployer.getAddress()
  );

  let StakingHub = new ethers.Contract(
    stakingHub_address,
    StakingHubArtifact.abi,
    deployer
  );
  let result = await StakingHub.transferOwnership(newOwner);
  
  console.log(result.hash)
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
