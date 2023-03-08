const AD3Hub_Artifact = require("../artifacts/contracts/AD3Hub.sol/AD3Hub.json")
const ad3Hub_address = '0x63ae9644cF5Eda0A3B7f436232C181DbE4542B8E';

const newOwner = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';


// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    await deployer.getAddress()
  );

  let AD3Hub = new ethers.Contract(
    ad3Hub_address,
    AD3Hub_Artifact.abi,
    deployer
  );
  let result = await AD3Hub.transferOwnership(newOwner);
  
  console.log(result.hash)
}



main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
