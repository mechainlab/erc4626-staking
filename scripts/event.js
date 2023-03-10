const { ethers } = require('ethers');
const StakingHubArtifact = require("../artifacts/contracts/StakingHub.sol/StakingHub.json");


// async function main() {

//     let provider = new ethers.providers.JsonRpcProvider(
//         "http://47.242.179.164:9933"
//     );
//     const stakingHub_address = "0x00BF3DEeEeD0F7cdDdEe197574B82b845013fDF7";


//     //转出
//     let StakingHub = new ethers.Contract(
//         stakingHub_address,
//         StakingHubArtifact.abi,
//         provider
//     );
//     // let filterFrom = StakingHub.filters.WithdrawRewards("0xc6b4F991A13C77cD4eF65b81583E86421D9c924d");
//     const filter = {
//         address: stakingHub_address,
//         fromBlock: "0xe5ba",
//         toBlock: "0xe5c1",
//         topics: [ethers.utils.id("WithdrawRewards(address,uint256)")]
//     };
//     let eventsFrom = await StakingHub.queryFilter(filter);

//     console.log(eventsFrom);

//     // 监听提取利润事件
//     // const filter = {
//     //     address: stakingHub_address,
//     //     topics: [ethers.utils.id("WithdrawRewards(address,uint256)")]
//     // };

//     // provider.on(filter, (log) => {
//     //     console.log(`WithdrawRewards event detected:`);
//     //     console.log(log);
//     // });

// }


// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error(error);
//         process.exit(1);
//     });


// 监听提取利润事件
let provider = new ethers.providers.JsonRpcProvider(
    "http://47.242.179.164:9933"
);
const stakingHub_address = "0x00BF3DEeEeD0F7cdDdEe197574B82b845013fDF7";
const filter = {
    address: stakingHub_address,
    topics: [ethers.utils.id("Deposit(address,address,uint256,uint256)")]
};

provider.on(filter, (log) => {
    console.log(`deposit event detected:`);
    console.log(log);
});