// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./StandardRewardVault.sol";
import "./interfaces/IRewardVault.sol";

/**
 * @title StakingHub，存入aleo，赚取奖励
 * @dev 继承ERC4626"代币化金库标准"的实现：https://eips.ethereum.org/EIPS/eip-4626[EIP-4626],
 * @dev 并在ERC4626金库标准上增加奖励的相关逻辑
 *
 * @notice 协议奖励以实际链上状态为准，领取完则结束产生奖励，资金逻辑以代码为准;
 */
contract StakingHub is ERC4626, Ownable{

   /*//////////////////////////////////////////////////////////////
                                 事件
   //////////////////////////////////////////////////////////////*/
   event WithdrawRewards(address indexed user, uint256 amount);
   event WithdrawProtocol(address indexed owner, uint256 amount);


    /*//////////////////////////////////////////////////////////////
                                状态变量
    //////////////////////////////////////////////////////////////*/
    uint16 public _profitRate = 400; // 年化利率 = profitRate/10000
    mapping(address => uint256) public unclaimedRewards; // 代币地址->待领取奖励的映射，记录待领取的奖励
    mapping(address => uint256) public startTimes; // 代币地址->存款日期，记录计息开始时间
    address public _rewardValult; //StakingHub的奖励金库, 和本金隔离;


    /**
     * @dev 初始化底层资产地址（aleo）、年化利率（默认4%）、LP代币名称和符号(stAleo).
     * @param asset_ 资产地址
     * @param rewardAsset_ 奖励资产地址
     * @param profitRate_ 年利率
     */
    constructor(address asset_, address rewardAsset_, uint16 profitRate_) ERC4626(IERC20(asset_)) ERC20("stAleo", "stAleo"){
        require(profitRate_ < 10000, "year's profit rate must less than 100%");
        _profitRate = profitRate_;

        //创建奖励金库
        StandardRewardVault rewardVault_ = new StandardRewardVault(rewardAsset_);
        _rewardValult = address(rewardVault_);    
    }




    /*//////////////////////////////////////////////////////////////
                             存款/提款逻辑
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev 存款入口， See {IERC4626-deposit}.
     * @dev 重写ERC4626实现，增加奖励计算的逻辑
     *
     * @param assets 存入资产数量
     * @param receiver 受益人
     *
     */
    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        require(assets <= maxDeposit(receiver), "ERC4626: deposit more than max");

        // 校验剩余奖励
        uint256 rewardValultBalance = IRewardVault(_rewardValult).balance();
        require(rewardValultBalance > 0 , "ERC4626: no reward balance");

        // 每次用户余额变动时，根据变动前的余额和存入时间段，更新待领取奖励
        updateRewardRecord(receiver);

        // 奖励金库减半后，更新利率
        // if(rewardValultBalance * 2 < IRewardVault(_rewardValult).lastAmount()){
        //     _profitRate = _profitRate/2;
        //     IRewardVault(_rewardValult).updateLastAmount(rewardValultBalance);
        // }


        // 根据存入资产数量计算需要mint的份额凭证，默认为1:1的关系
        uint256 shares = previewDeposit(assets);
        // 从用户地址转移资产到协议，并为用户mint对应数量的份额凭证
        _deposit(_msgSender(), receiver, assets, shares);

        return shares;
    }


    /**
     * @dev 取款入口, See {IERC4626-withdraw} .
     * @dev 重写ERC4626实现，增加奖励计算的逻辑
     *
     * @param assets 提取资产数量
     * @param receiver 收款人
     *
     */
    function withdraw(uint256 assets, address receiver, address owner) public override returns (uint256) {
        require(assets <= maxWithdraw(owner), "ERC4626: balance more than max");

        // 每次用户余额变动时，根据变动前的余额和存入时间段，更新待领取奖励
        updateRewardRecord(owner);

        // 根据提取资产数量计算需要销毁的份额凭证，默认为1:1的关系
        uint256 shares = previewWithdraw(assets);
        // 从协议转移资产到收款人地址，并为销毁owner对应数量的份额凭证
        ERC4626._withdraw(_msgSender(), receiver, owner, assets, shares);

        mapping(address => uint256) memory tests;

        return shares;
    }

    /**
     * @dev 领取奖励入口.
     * @param amount 领取奖励金额
     *
     */
    function withdrawRewards(uint256 amount) external {
        // 计算最新一次存款时间段的奖励 + 历史未领取奖励
        uint256 maxReward = linearReward(msg.sender, uint256(block.timestamp)) + unclaimedRewards[msg.sender];
        require(amount <= maxReward, "ERC4626: claimReward more than maxReward");
        // 更新待领取奖励
        unclaimedRewards[msg.sender] = maxReward - amount;
        // 更新存款开始时间
        startTimes[msg.sender] = block.timestamp;
        // 转出奖励给用户
        IRewardVault(_rewardValult).award(msg.sender, amount);
        emit WithdrawRewards(msg.sender, amount);
    }


    /**
     * @dev 取款（全部本金 + 奖励).
     */
    function withdrawAll() public returns (uint256) {
        require(balanceOf(msg.sender) > 0, "ERC4626: no balance");
        // 提取奖励
        withdrawAllRewards();
        // 提取本金
        uint256 shares = balanceOf(msg.sender);
        uint256 assets = previewRedeem(shares);
        ERC4626._withdraw(_msgSender(), msg.sender, msg.sender, assets, shares);

        return shares;
    }


    /**
     * @dev 领取全部奖励入口.
     *
     */
    function withdrawAllRewards() public {
        // 计算最新一次存款时间段的奖励 + 历史未领取奖励
        uint256 reward = linearReward(msg.sender, uint256(block.timestamp)) + unclaimedRewards[msg.sender];
        // 更新待领取奖励
        unclaimedRewards[msg.sender] = 0;
        // 更新存款开始时间
        startTimes[msg.sender] = block.timestamp;
        // 转出奖励给用户
        IRewardVault(_rewardValult).award(msg.sender, reward);
        emit WithdrawRewards(msg.sender, reward);
    }

    /**
     * @dev See {IERC20-transfer}.
     * @dev 存款权益转移
     * @dev 重写transfer，增加奖励计算逻辑
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();

        //更新待领取奖励、计息起始时间
        updateRewardRecord(owner);
        updateRewardRecord(to);

        _transfer(owner, to, amount);

        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     * @dev 存款权益转移
     * @dev 重写transferFrom，增加奖励计算逻辑
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        
        // 更新待领取奖励、计息起始时间
        updateRewardRecord(from);
        updateRewardRecord(to);

        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);

        return true;
    }

    /**
     * @dev 更新待领取奖励、计息起始时间.
     * @param user 用户.
     */
    function updateRewardRecord(address user) internal{
        // 更新待领取奖励
        unclaimedRewards[user] += linearReward(user, uint256(block.timestamp));
        // 更新存款开始时间
        startTimes[user] = block.timestamp;
    }

    /**
     * @dev 根据线性释放公式，计算已实现奖励.
     * @param user 领取奖励的用户
     * @param timestamp 区块时间
     */
    function linearReward(address user, uint256 timestamp) internal view returns (uint256) {
        if (startTimes[user] == 0 || timestamp < startTimes[user]) {
            // 没有计息开始日期||时间非法，直接返回0
            return 0;
        } else {
            // 计算年奖励
            uint256 reward = (balanceOf(user) * _profitRate) / 10000;
            // 返回已实现奖励
            return (reward * (timestamp - startTimes[user])) / (365 days);
        }
    }

    /*//////////////////////////////////////////////////////////////
                             管理员逻辑
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev 协议资金提取.
     * @param amount 提取金额
     */
    function withdrawProtocol(uint256 amount) external onlyOwner {

        uint256 balance = IRewardVault(_rewardValult).balance();
        require(amount <= balance, "ERC4626: amount more than protocol balance");
        IRewardVault(_rewardValult).award(msg.sender, amount);

        emit WithdrawProtocol(msg.sender, amount);
    }

    /**
     * @dev 初始化协议奖金.
     * @param amount 金额
     */
    function prepareRewardVault(uint256 amount) external onlyOwner {
        address rewardAsset = IRewardVault(_rewardValult).getAssetAddress();
        IERC20(rewardAsset).transferFrom(msg.sender, _rewardValult, amount);
    }

    /**
     * @dev 修改利率.
     * @param profitRate_ 金额
     */
    function changeProfitRate(uint16 profitRate_) external onlyOwner {
        require(profitRate_ < 10000, "year's profit rate must less than 100%");
        _profitRate = profitRate_;
    }

    /*//////////////////////////////////////////////////////////////
                               限额逻辑
    //////////////////////////////////////////////////////////////*/
    /** @dev See {IERC4626-maxDeposit}. */
    function maxDeposit(address receiver) public view override returns (uint256) {
        uint256 balance = balanceOf(receiver);
        //max deposit is 10000;
        return 100000 * 10 ** 6 - balance;
    }


    /*//////////////////////////////////////////////////////////////
                              状态查询逻辑
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev 查询用户总资产（存款+奖励）.
     * @param user 用户
     */
    function reviewAssets(address user) external view returns(uint256) {
        return _convertToAssets(balanceOf(user), Math.Rounding.Down) + reviewReward(user);
    }


    /**
     * @dev 查询用户存款.
     * @param user 用户
     */
    function reviewAmount(address user) external view returns(uint256) {
        return _convertToAssets(balanceOf(user), Math.Rounding.Down);
    }
    /**
     * @dev 查询用户可领取奖励.
     * @param user 用户
     */
    function reviewReward(address user) public view returns(uint256) {
        // 计算最新一次存款时间段的奖励 + 历史未领取奖励
        uint256 reward = linearReward(user, uint256(block.timestamp)) + unclaimedRewards[user];
        return reward;
    }

    /**
     * @dev 查询协议总存款余额.
     *
     */
    function reviewProtocol() external view returns(uint256) {
        uint256 balance = IERC20(super.asset()).balanceOf(address(this));
        return balance;
    }

    /**
     * @dev 查询协议奖励金库余额.
     *
     */
    function reviewRewardVault() external view returns(uint256) {
        uint256 balance = IRewardVault(_rewardValult).balance();
        return balance;
    }

}
