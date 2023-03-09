// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title IRewardVault 奖励金库
 * @dev 管理奖金和发放奖金
 *
 * @notice
 */
interface IRewardVault {


    /**
     * @dev 奖励发放.
     * @param recevier 领取地址
     * @param amount 金额
     *
     */
    function award(address recevier, uint256 amount) external returns (bool);

    /**
     * @dev 奖励金库余额.
     * @return 余额
     *
     */
    function balance() external view returns (uint256);


    /**
     * @dev 查询奖励资产地址.
     * @return 地址
     *
     */
    function getAssetAddress() external view returns (address);
}