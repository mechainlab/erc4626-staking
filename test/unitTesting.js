const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const Campaign_Artifact = require("../artifacts/contracts/Campaign.sol/Campaign.json")
const Token_Artifact = require("../artifacts/contracts/Token.sol/TetherToken.json")
require("hardhat-gas-reporter");

// Ad3 contract uniting test
describe("Ad3 contract", function () {

  async function deployAD3HubFixture() {
    // Get the ContractFactory and Signers here.
    const AD3Hub = await ethers.getContractFactory("AD3Hub");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const ad3Hub = await AD3Hub.deploy();
    await ad3Hub.deployed();
    // Fixtures can return anything you consider useful for your tests
    return { ad3Hub, owner, addr1, addr2 };
  }


  // token of payment
  async function deployPaymentToken() {
    const USDT = await ethers.getContractFactory("TetherToken");
    const token = await USDT.deploy(10 ** 12); //totalSupply = $10 ** 6
    await token.deployed();
    return { token };
  }


  async function deployCampaignImpl() {
    // Get the ContractFactory and Signers here.
    const Campaign = await ethers.getContractFactory("Campaign");

    const campaign = await Campaign.deploy();
    await campaign.deployed();
    // Fixtures can return anything you consider useful for your tests
    return { campaign };
  }


  //kols for deployment
  async function getKolsFixtrue() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    let kols = [
      {
        kolAddress: addr1.getAddress(),
        fixedFee: 100,
        ratio: 70,
        paymentStage: 0,
      },
      {
        kolAddress: addr2.getAddress(),
        fixedFee: 100,
        ratio: 70,
        paymentStage: 0,
      }
    ];
    return kols;
  }

  //kols for pushpay
  async function getKolWithUsers() {
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();
    let kolWithUsers = [
      {
        kolAddress: addr1.getAddress(),
        users: [addr3.getAddress(), addr4.getAddress()]
      },
      {
        kolAddress: addr2.getAddress(),
        users: [addr5.getAddress(), addr6.getAddress()]

      }
    ];
    return kolWithUsers;
  }

//kols for pushPayKol
async function getKolWithUserQuantity() {
  const [owner, addr1, addr2, addr3, addr4, addr5, addr6, addr7] = await ethers.getSigners();

  let kolWithQuantity = [
      {
          kolAddress: addr1.getAddress(),
          quantity: 2
      },
      {
          kolAddress: addr2.getAddress(),
          quantity: 3
      }
  ];

  return kolWithQuantity;
}

  //kols for payfixFee
  async function getKolsAddress() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    let kols = [
      addr1.getAddress(),
      addr2.getAddress()
    ];
    return kols;
  }

  // Test Deployment of Hub
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { ad3Hub, owner } = await loadFixture(deployAD3HubFixture);
      //Check ad3Hub's owner
      expect(await ad3Hub.owner()).to.equal(owner.address);
    });

    it("Should paymentAddess of ad3Hub equals setPaymentToken", async function () {
      const { ad3Hub, owner } = await loadFixture(deployAD3HubFixture);
      const { token } = await deployPaymentToken();

      //Set and Check paymentToken
      await ad3Hub.setPaymentToken(token.address);
      let payment = await ad3Hub.getPaymentToken();
      console.log("paymentAddess:" + payment);
      expect(payment).to.equal(token.address);
    });
  });

});
