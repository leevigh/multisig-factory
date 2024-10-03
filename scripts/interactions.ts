import { ethers } from "hardhat";

async function main() {
    /**
     * MultisigFactory Functions:
     * function createMultisigWallet(uint8 _quorum, address[] memory _validSigners) 
     *  external 
     *  returns (Multisig newMulsig_, uint256 length_)
     * 
     * function getMultiSigClones() external view returns(Multisig[] memory)
     * 
     * Web3CXIModule#Web3CXI - 0x9Add3CA56bc0bcC75636eB8f2e457eA28d0dE76b
     */
    const [ owner, addr1, addr2, addr4 ] = await ethers.getSigners();
    // const validSigners = [
    //     "0x0f490D84DDd5E0A2881eF8F319664C7f8Fd6335C", 
    //     "0x4fe4C7Fb6D7Bc04F98866074Dd9299681F981346", 
    //     "0xD8BDE66913d21918440d8eA38dcd6DA89b38c1fB"
    // ]

    const MultisigFactoryAddress = "0x61e8977Df46761e3519B3e596d1c20cA41bF0D0D";
    const MultisigAddress = "0x860F3a1D35Fe996BD57318927a00190D263F7bE9";
    const multisigFactory = await ethers.getContractAt("IMultisigFactory", MultisigFactoryAddress);
    const multisig = await ethers.getContractAt("IMultisig", MultisigAddress);

    const web3CXITokenAddress = "0x9Add3CA56bc0bcC75636eB8f2e457eA28d0dE76b";
    const web3CXI = await ethers.getContractAt("IERC20", web3CXITokenAddress);

    const approvalAmount = ethers.parseUnits("1000", 18);

    // const MultisigFactory = await ethers.getContractFactory("MultisigFactory", MultisigFactoryAddress)

    // const saveERC20ContractAddress = "0xD410219f5C87247d3F109695275A70Da7805f1b1";
    // const saveERC20 = await ethers.getContractAt("ISaveERC20", saveERC20ContractAddress);

    // Approve savings contract to spend token
    // const approvalAmount = ethers.parseUnits("1000", 18);

    const total = await web3CXI.totalSupply();
    console.log("TOTAL SUPPLY:::", total);

    const getMultisigCloneTx = await multisigFactory.getMultiSigClones();

    const createMultisigWalletTx = await multisigFactory.createMultisigWallet(2, [owner, addr1, addr2]);
    createMultisigWalletTx.wait();

    // const approveTx = await web3CXI.approve(MultisigAddress, approvalAmount);
    // approveTx.wait();

    const transferTokenTx = await web3CXI.transfer(multisig, ethers.parseUnits("200", 18));
    transferTokenTx.wait();
    console.log("TRANSFER", transferTokenTx);

    const multisigBalanceBeforeDeposit = await web3CXI.balanceOf(MultisigAddress);
    console.log("Contract balance before :::", multisigBalanceBeforeDeposit);

    // Transfer amount from multisig wallet
    const transferTx = await multisig.transfer(
        ethers.parseUnits("10", 18), 
        owner, 
        web3CXITokenAddress
    )
    transferTx.wait();

    console.log("Transfer Transaction:::",transferTx);

    const approveTransferTx = await multisig.connect(addr1).approveTx(1);
    approveTransferTx.wait();

    console.log("Approve Transfer Transaction:::",approveTransferTx);

    const updateQuorumTx = await multisig.updateQuorum(3);
    updateQuorumTx.wait();

    console.log("Update Quorum Transaction:::",updateQuorumTx);

    const approveUpdateQuorumTx = await multisig.connect(addr1).approveUpdateTx(1);
    approveUpdateQuorumTx.wait();

    console.log("Approve Update Quorum Transaction:::",approveUpdateQuorumTx);

    // console.log("Created Multisig Wallet", createMultisigWalletTx);

    console.log(getMultisigCloneTx);





    // const contractBalanceBeforeDeposit = await saveERC20.getContractBalance();
    // console.log("Contract balance before :::", contractBalanceBeforeDeposit);

    // const depositAmount = ethers.parseUnits("150", 18);
    // const depositTx = await saveERC20.deposit(depositAmount);

    // console.log(depositTx);

    // depositTx.wait();

    // const contractBalanceAfterDeposit = await saveERC20.getContractBalance();

    // console.log("Contract balance after :::", contractBalanceAfterDeposit);



    // Withdrawal Interaction
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});