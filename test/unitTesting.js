const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
require("hardhat-gas-reporter");
const Token_Artifact = require("../artifacts/contracts/Token.sol/AleoToken.json");
const StakingHubArtifact = require("../artifacts/contracts/StakingHub.sol/StakingHub.json");

// StakingHub contract uniting test
describe("StakingHub Contract Test", function () {

  async function deployStakingHub() {
    ///prepare deployer and user
    const [deployer, user1, user2] = await ethers.getSigners();


    ///deploy AleoToken
    const AleoToken = await ethers.getContractFactory("AleoToken");
    const aleoToken = await AleoToken.deploy(10 ** 6 * 10 ** 6); //totalSupply = $10 ** 6
    await aleoToken.deployed();

    ///delploy StakingHub
    const StakingHub = await ethers.getContractFactory("StakingHub");
    const stakingHub = await StakingHub.deploy(aleoToken.address, aleoToken.address, 500);
    await stakingHub.deployed();

    ///prepare rewardFund of StakingHub
    await aleoToken.approve(stakingHub.address, 100 * 10 ** 6);
    await stakingHub.prepareRewardVault(100 * 10 ** 6);

    await aleoToken.transfer(user1.getAddress(), 1000 * 10 ** 6);

    // await new Promise((resolve, reject) => {
    //   setTimeout(function () {
    //     resolve('time')
    //   }, 1000)
    // })

    return { stakingHub, aleoToken, deployer, user1 };
  }


  // Test Deployment of Hub
  describe("Deployment-Test", function () {
    it("Should set the right owner", async function () {
      const { stakingHub, aleoToken, deployer, user1 } = await loadFixture(deployStakingHub);
      //Check ad3Hub's owner
      expect(await stakingHub.owner()).to.equal(await deployer.getAddress());
    });

    it("Should be the correct amount", async function () {
      const { stakingHub, aleoToken, deployer, user1 } = await loadFixture(deployStakingHub);
      expect(await stakingHub.reviewRewardVault()).to.equal(100 * 10 ** 6);
      expect(await stakingHub.reviewProtocol()).to.equal(0);
    });
  });


  // Test Staking
  describe("StakingAndWithdraw-Test", function () {
    it("User's assets should be correct", async function () {
      const { stakingHub, aleoToken, deployer, user1 } = await loadFixture(deployStakingHub);
      // staking
      let token = new ethers.Contract(aleoToken.address, Token_Artifact.abi, user1);
      await token.approve(stakingHub.address, 1000 * 10 ** 6);

      let StakingHub = new ethers.Contract(
        stakingHub.address,
        StakingHubArtifact.abi,
        user1
      );
      await StakingHub.deposit(1000 * 10 ** 6, user1.getAddress());
      expect(await stakingHub.reviewAssets(user1.getAddress())).to.equal(1000 * 10 ** 6);
      expect(await token.balanceOf(user1.getAddress())).to.equal(0);
      expect(await stakingHub.reviewProtocol()).to.equal(1000 * 10 ** 6);

      //withdraw
      await StakingHub.withdraw(100 * 10 ** 6, user1.getAddress(), user1.getAddress());
      expect(await stakingHub.reviewAssets(user1.getAddress())).to.equal(900 * 10 ** 6);
      expect(await token.balanceOf(user1.getAddress())).to.equal(100 * 10 ** 6);
      expect(await stakingHub.reviewProtocol()).to.equal(900 * 10 ** 6);

      // await new Promise((resolve, reject) => {
      //   // await for award
      //   setTimeout(function () {
      //     resolve('time')
      //   }, 5000)
      // })
      // expect(await stakingHub.reviewReward(user1.getAddress())).to.greaterThan(0);


      //one more staking 
      const [, , user3] = await ethers.getSigners();
      await token.transfer(user3.getAddress(), 10 * 10 ** 6);

      let token3 = new ethers.Contract(aleoToken.address, Token_Artifact.abi, user3);
      await token3.approve(stakingHub.address, 10 * 10 ** 6);
      let StakingHub3 = new ethers.Contract(
        stakingHub.address,
        StakingHubArtifact.abi,
        user3
      );
      await StakingHub3.deposit(10 * 10 ** 6, user3.getAddress());
      expect(await stakingHub.reviewAssets(user3.getAddress())).to.equal(10 * 10 ** 6);
      expect(await token3.balanceOf(user3.getAddress())).to.equal(0);
      expect(await stakingHub.reviewProtocol()).to.equal(910 * 10 ** 6);


      //withdraw
      await StakingHub3.withdrawAll();
      expect(await stakingHub.reviewAssets(user3.getAddress())).to.equal(0);
      expect(await token.balanceOf(user3.getAddress())).to.greaterThanOrEqual(10 * 10 ** 6);

      expect(await stakingHub.reviewProtocol()).to.equal(900 * 10 ** 6);
      expect(await stakingHub.reviewAssets(user1.getAddress())).to.equal(900 * 10 ** 6);


    });

  });


});
