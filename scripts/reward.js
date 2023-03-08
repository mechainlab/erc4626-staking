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
    withdrawRewards();
}

async function withdrawRewards() {
    ///Prepare deployer
    let privateKey = "0x8d35ea35953931a53fa05da3f396be651102514b2eac740911cb9d0aca0f8e61";
    let customHttpProvider = new ethers.providers.JsonRpcProvider(
        "http://47.242.179.164:9933"
    );
    const signer = new ethers.Wallet(privateKey, customHttpProvider);
    console.log(signer.address);

    ///Review reward
    let token = new ethers.Contract(aleo_address, Token_Artifact.abi, signer);
    let StakingHub = new ethers.Contract(
        stakingHub_address,
        StakingHubArtifact.abi,
        signer
    );
    let staking_reward = await StakingHub.reviewReward(signer.address);
    console.log("user's staking reward: " + staking_reward);


    ///Withdraw rewards
    await StakingHub.withdrawRewards(staking_reward - 100);
    await new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve('time')
        }, 2000)
    })
    staking_reward = await StakingHub.reviewReward(signer.address);
    console.log("user's staking reward: " + staking_reward);
}

async function withdraw() {
    ///Prepare deployer
    let privateKey = "0x8d35ea35953931a53fa05da3f396be651102514b2eac740911cb9d0aca0f8e61";
    let customHttpProvider = new ethers.providers.JsonRpcProvider(
        "http://47.242.179.164:9933"
    );
    const signer = new ethers.Wallet(privateKey, customHttpProvider);
    console.log(signer.address);

    ///Review reward
    let token = new ethers.Contract(aleo_address, Token_Artifact.abi, signer);
    let StakingHub = new ethers.Contract(
        stakingHub_address,
        StakingHubArtifact.abi,
        signer
    );
    let review_assets = await StakingHub.reviewAssets(signer.address);
    console.log("user's staking assets: " + review_assets);


    ///Withdraw rewards
    await StakingHub.withdraw(review_assets - 100);
    await new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve('time')
        }, 2000)
    })
    review_assets = await StakingHub.reviewAssets(signer.address);
    console.log("user's staking assets: " + review_assets);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
