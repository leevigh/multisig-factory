// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../Multisig.sol";

interface IMultisigFactory {

    function createMultisigWallet(uint8 _quorum, address[] memory _validSigners) external returns (Multisig newMulsig_, uint256 length_);

    function getMultiSigClones() external view returns(Multisig[] memory);
}