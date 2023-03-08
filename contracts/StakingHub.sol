// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./RewardVault.sol";

/**
 * @title StakingHub，存入aleo，赚取利息
 * @dev 继承ERC4626"代币化金库标准"的实现：https://eips.ethereum.org/EIPS/eip-4626[EIP-4626].
 * @dev 并在ERC4626金库标准上增加利息奖励的相关逻辑
 *
 * @notice 协议奖励以实际链上状态为准，领取完则结束产生利息，资金逻辑以代码为准；
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
    mapping(address => uint256) public unclaimedRewards; // 代币地址->待领取利息的映射，记录待领取的利息
    mapping(address => uint256) public startTimes; // 代币地址->存款日期，记录计息开始时间
    address public _rewardValult; //StakingHub的利息金库, 和本金隔离;


    /**
     * @dev 初始化底层资产地址（aleo）、年化利率（默认4%）、LP代币名称和符号(stAleo).
     * @param asset_ 资产地址
     * @param rewardAsset_ 奖励资产地址
     * @param profitRate_ 年利率
     */
    constructor(IERC20 asset_, address rewardAsset_, uint16 profitRate_) ERC4626(asset_) ERC20("stAleo", "stAleo"){
        require(profitRate_ < 10000, "year's profit rate must less than 100%");
        _profitRate = profitRate_;

        //创建奖励金库
        RewardVault rewardVault_ =new RewardVault(rewardAsset_);
        _rewardValult = address(rewardVault_);    
    }




    /*//////////////////////////////////////////////////////////////
                        存款/提款逻辑
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev 存款入口， See {IERC4626-deposit}.
     * @dev 重写ERC4626实现，增加利息计算的逻辑
     *
     * @param assets 存入资产数量
     * @param receiver 受益人
     *
     */
    function deposit(uint256 assets, address receiver) public virtual override returns (uint256) {
        require(assets <= maxDeposit(receiver), "ERC4626: deposit more than max");
        uint256 rewardValultBalance = RewardVault(_rewardValult).balance();
        require(rewardValultBalance > 0 , "ERC4626: no reward balance");

        // 每次用户余额变动时，根据变动前的余额和已存入时间段，计算待领取利息数量
        unclaimedRewards[receiver] += linearReward(receiver, uint256(block.timestamp));
        // 更新存款开始时间
        startTimes[receiver] = block.timestamp;

        //update profitRate
        if(rewardValultBalance * 2 < RewardVault(_rewardValult).lastAmount()){
            _profitRate = _profitRate/2;
            RewardVault(_rewardValult).updateLastAmount(rewardValultBalance);
        }

        // 根据存入资产数量计算需要mint的份额凭证，默认为1:1的关系
        uint256 shares = previewDeposit(assets);
        // 从用户地址转移资产到协议，并为用户mint对应数量的份额凭证
        _deposit(_msgSender(), receiver, assets, shares);

        return shares;
    }


    /**
     * @dev 取款入口, See {IERC4626-withdraw} .
     * @dev 重写ERC4626实现，增加利息计算的逻辑
     *
     * @param assets 提取资产数量
     * @param receiver 收款人
     *
     */
    function withdraw(uint256 assets, address receiver, address owner) public virtual override returns (uint256) {
        require(assets <= maxWithdraw(owner), "ERC4626: balance more than max");

        // 每次用户余额变动时，根据变动前的余额和存入时间段，计算待领取利息数量
        unclaimedRewards[owner] += linearReward(owner, uint256(block.timestamp));
        // 更新存款开始时间
        startTimes[owner] = block.timestamp;

        // 根据提取资产数量计算需要销毁的份额凭证，默认为1:1的关系
        uint256 shares = previewWithdraw(assets);
        // 从协议转移资产到收款人地址，并为销毁owner对应数量的份额凭证
        super._withdraw(_msgSender(), receiver, owner, assets, shares);

        return shares;
    }


    /**
     * @dev 取款（全部本金 + 利息).
     */
    function withdrawAll() public returns (uint256) {
        require(balanceOf(msg.sender) > 0, "ERC4626: no balance");
        // 提取利息
        withdrawAllRewards();

        // 提取本金
        uint256 assets = IERC20(super.asset()).balanceOf(msg.sender);
        uint256 shares = previewWithdraw(assets);
        super._withdraw(_msgSender(), msg.sender, msg.sender, assets, shares);

        return shares;
    }

    /**
     * @dev 领取奖励入口.
     * @param amount 领取奖励金额
     *
     */
    function withdrawRewards(uint256 amount) external {
        // 计算最新一次存款时间段的利息 + 历史未领取利息
        uint256 maxReward = linearReward(msg.sender, uint256(block.timestamp)) + unclaimedRewards[msg.sender];
        require(amount < maxReward, "ERC4626: claimReward more than maxReward");

        // 更新待领取利息
        unclaimedRewards[msg.sender] = maxReward - amount;
        // 更新计息开始时间
        startTimes[msg.sender] = block.timestamp;
        // 转出利息给用户
        RewardVault(_rewardValult).transfer(msg.sender, amount);
        emit WithdrawRewards(msg.sender, amount);
    }

    /**
     * @dev 领取全部奖励入口 .
     *
     */
    function withdrawAllRewards() public {
        // 计算最新一次存款时间段的利息 + 历史未领取利息
        uint256 reward = linearReward(msg.sender, uint256(block.timestamp)) + unclaimedRewards[msg.sender];
        // 更新待领取利息为0
        unclaimedRewards[msg.sender] = 0;
        // 更新计息开始时间
        startTimes[msg.sender] = block.timestamp;
        // 转出利息给用户
        RewardVault(_rewardValult).transfer(msg.sender, reward);
        emit WithdrawRewards(msg.sender, reward);
    }

    /**
     * @dev See {IERC20-transfer}.
     * @dev 存款权益转移
     * @dev 重写transfer，增加利息计算逻辑
     */
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);

        // 余额变动，计算待领取利息
        unclaimedRewards[owner] += linearReward(owner, uint256(block.timestamp));
        // 更新存款开始时间
        startTimes[owner] = block.timestamp;

        // 余额变动，计算待领取利息
        unclaimedRewards[to] += linearReward(to, uint256(block.timestamp));
        // 更新存款开始时间
        startTimes[to] = block.timestamp;
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     * @dev 存款权益转移
     * @dev 重写transferFrom，增加利息计算逻辑
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);

        // 余额变动，计算待领取利息
        unclaimedRewards[from] += linearReward(from, uint256(block.timestamp));
        // 更新存款开始时间
        startTimes[from] = block.timestamp;

        // 余额变动，计算待领取利息
        unclaimedRewards[to] += linearReward(to, uint256(block.timestamp));
        // 更新存款开始时间
        startTimes[to] = block.timestamp;
        return true;
    }

    /**
     * @dev 根据线性释放公式，计算已实现利息.
     * @param user 领取奖励的用户
     * @param timestamp 区块时间
     */
    function linearReward(address user, uint256 timestamp) internal view returns (uint256) {
        // 根据线性释放公式，计算已实现利息
        if (startTimes[user] == 0 || timestamp < startTimes[user]) {
            return 0;
        } else {
            // 计算年利息
            uint256 reward = (balanceOf(user) * _profitRate) / 10000;
            // 返回已实现利息
            return (reward * (timestamp - startTimes[user])) / (365 days);
        }
    }

    /**
     * @dev 协议资金提取.
     * @param amount 提取金额
     */
    function withdrawProtocol(uint256 amount) external onlyOwner {

        uint256 balance = RewardVault(_rewardValult).balance();
        require(amount <= balance, "ERC4626: amount more than protocol balance");
        RewardVault(_rewardValult).transfer(msg.sender, amount);

        emit WithdrawProtocol(msg.sender, amount);
    }

    /*//////////////////////////////////////////////////////////////
                            限额逻辑
    //////////////////////////////////////////////////////////////*/
    /** @dev See {IERC4626-maxDeposit}. */
    function maxDeposit(address receiver) public view override returns (uint256) {
        uint256 balance = IERC20(super.asset()).balanceOf(receiver);
        //max deposit is 10000;
        return 10000 * 10 ** 6 - balance;
    }


    /*//////////////////////////////////////////////////////////////
                            状态查询逻辑
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev 查询用户存款.
     * @param user 用户
     */
    function reviewAssets(address user) external view returns(uint256) {
        return _convertToAssets(balanceOf(user), Math.Rounding.Down);
    }

    /**
     * @dev 查询用户可领取奖励.
     * @param user 用户
     */
    function reviewReward(address user) external view returns(uint256) {
        // 计算最新一次存款时间段的利息 + 历史未领取利息
        uint256 reward = linearReward(user, uint256(block.timestamp)) + unclaimedRewards[user];
        return reward;
    }

    /**
     * @dev 查询协议资金.
     *
     */
    function reviewProtocol() external view returns(uint256) {
        uint256 balance = IERC20(super.asset()).balanceOf(address(this));
        return balance;
    }
}
