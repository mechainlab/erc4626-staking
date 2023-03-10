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
    await withdrawRewards();
}

async function withdrawRewards() {
    ///Prepare deployer
    let privateKey = "0x537682a041dc2a904573b6045bfbc9442940868b6aabaaa64bb4036677feb69a";
    let customHttpProvider = new ethers.providers.JsonRpcProvider(
        "http://47.242.179.164:9933"
    );
    const signer = new ethers.Wallet(privateKey, customHttpProvider);
    console.log(signer.address);

    ///Review reward
    let token = new ethers.Contract(aleo_address, Token_Artifact.abi, signer);
    let balance = await token.balanceOf(signer.getAddress());
    console.log("balance:" + ethers.utils.formatUnits(balance, 6));
    let StakingHub = new ethers.Contract(
        stakingHub_address,
        StakingHubArtifact.abi,
        signer
    );
    let staking_reward = await StakingHub.reviewReward("0x17155EE3e09033955D272E902B52E0c10cB47A91");
    console.log("user's staking reward: " + staking_reward);

    let reviewAssets = await StakingHub.reviewAssets("0x17155EE3e09033955D272E902B52E0c10cB47A91");
    console.log("user's staking reviewAssets: " + reviewAssets);

    // ///Withdraw rewards
    // await StakingHub.withdrawRewards(1, overrides);

    // await new Promise((resolve, reject) => {
    //     setTimeout(function () {
    //         resolve('time')
    //     }, 1000)
    // })
    // staking_reward = await StakingHub.reviewReward(signer.address);
    // console.log("user's staking reward: " + staking_reward);
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
    let balance = await token.balanceOf(user1.getAddress());
    console.log(balance);

    let StakingHub = new ethers.Contract(
        stakingHub_address,
        StakingHubArtifact.abi,
        signer
    );
    let review_assets = await StakingHub.reviewAssets(signer.address);
    console.log("user's staking assets: " + review_assets);


    ///Withdraw rewards
    await StakingHub.withdraw(10 * 10 ** 6, signer.address, signer.address);
    await new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve('time')
        }, 2000)
    })
    review_assets = await StakingHub.reviewAssets(signer.address);
    console.log("user's staking assets: " + review_assets);
}


async function previewRewards() {
    ///Prepare provider 
    let customHttpProvider = new ethers.providers.JsonRpcProvider(
        "http://localhost:8545"
    );

    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    console.log("blockNumBefore:" + blockNumBefore);

    ///Review reward
    let StakingHub = new ethers.Contract(
        stakingHub_address,
        StakingHubArtifact.abi,
        customHttpProvider
    );
    let staking_reward = await StakingHub.reviewReward(signer.address);
    console.log("user's staking reward: " + staking_reward);


    const timeInterval = 60 * 60; //1 hour
    await ethers.provider.send('evm_increaseTime', [timeInterval]);
    await ethers.provider.send('evm_mine');

    const blockNumAfter = await ethers.provider.getBlockNumber();
    const blockAfter = await ethers.provider.getBlock(blockNumAfter);
    const timestampAfter = blockAfter.timestamp;
    console.log("blockNumAfter:" + blockNumAfter);
    console.log("timeInterval:" + timestampAfter - timestampBefore);

    // expect(blockNumAfter).to.be.equal(blockNumBefore + 1);
    // expect(timestampAfter).to.be.equal(timestampBefore + sevenDays);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
