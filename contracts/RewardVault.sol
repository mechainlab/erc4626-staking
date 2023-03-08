// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RewardVault 金库
 * @dev 管理StakingHub的利息
 *
 * @notice 协议奖励以实际链上状态为准，领取完则结束产生利息，资金逻辑以代码为准；
 */
contract RewardVault is Ownable {

    /*//////////////////////////////////////////////////////////////
                    状态变量
    //////////////////////////////////////////////////////////////*/
    address public assetAddress; //资产地址
    uint256 public lastAmount; //最近减半后余额

    /**
     * @dev 初始化奖励产地址.
     * @param assetAddress_ 资产地址
     */
    constructor(address assetAddress_) {
        assetAddress = assetAddress_;
    }



    /*//////////////////////////////////////////////////////////////
                    资金逻辑
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev 发放利息.
     * @param recevier 领取地址
     * @param amount 金额
     *
     */
    function transfer(address recevier, uint256 amount) public onlyOwner returns (bool)  {
        IERC20(assetAddress).transfer(recevier, amount);
        return true;
    }

    /**
     * @dev 更新最近减半后余额.
     * @param amount 金额
     *
     */
    function updateLastAmount(uint256 amount) public onlyOwner{
        lastAmount = amount;
    }

    /**
     * @dev 奖励金库余额.
     * @return 余额
     *
     */
    function balance() public view returns (uint256)  {
        return IERC20(assetAddress).balanceOf(address(this));
    }
}