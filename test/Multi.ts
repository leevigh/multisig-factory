// import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import { expect } from "chai";
// import { ethers } from "hardhat";

// describe("Multisig", function () {
  
//   async function deployToken() {
//     const erc20Token = await ethers.getContractFactory("Web3CXI");
//     const token = await erc20Token.deploy();

//     return { token };
//   }

//   async function deployMultisig() {
//     const [owner, otherAccount, anotherAccount, moreAccount] =
//       await ethers.getSigners();

//     const { token } = await deployToken();

//     const multisigContract = await ethers.getContractFactory("Multisig");
//     const quorum = 3;
//     const validSigners = [owner, otherAccount, anotherAccount, moreAccount];

//     const multisig = await multisigContract.deploy(quorum, validSigners);

//     return { multisig, owner, otherAccount, token };
//   }

//   describe("deployment", function () {
//     it("should check if numberOfValidSigners and quorum is intact", async function () {
//       const [owner, otherAccount, anotherAccount, moreAccount] =
//         await ethers.getSigners();

//       const multisigContract = await ethers.getContractFactory("Multisig");

//       const quorum = 3;
//       const validSigners = [owner, otherAccount, anotherAccount, moreAccount];

//       const multisig = await multisigContract.deploy(quorum, validSigners);

//       expect(await multisig.quorum()).to.be.equal(quorum);
//       expect(await multisig.noOfValidSigners()).to.be.equal(
//         validSigners.length
//       );
//     });

//     it("should revert if quorum is greater than valid Signers", async function () {
//       const [owner, otherAccount, anotherAccount, moreAccount] = await ethers.getSigners();

//       const multisigContract = await ethers.getContractFactory("Multisig");

//       const quorum = 5;
//       const validSigners = [owner, otherAccount, anotherAccount, moreAccount];

//       expect(multisigContract.deploy(quorum, validSigners)).to.be.revertedWith("quorum greater than valid signers");
//     });
//   });

//   describe("transfer transaction", function () {
//     it("should successfully create transfer transaction", async function () {
//       const [owner, otherAccount, anotherAccount, moreAccount] =
//         await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

//       // deposit tokens into contract
//       const depositAmount = ethers.parseUnits("500", 18);
//       await token.transfer(multisig, depositAmount);

//       // create transfer transaction
//       const transferAmount = ethers.parseUnits("100", 18);

//       const transferTx = await multisig.transfer(
//         transferAmount,
//         otherAccount,
//         token
//       );
//       await transferTx.wait();

//       expect(await multisig.txCount()).to.be.equal(1);
//       expect(await multisig.txCount()).to.be.greaterThanOrEqual(1);
//     });

//     it("should revert if invalid data is passed for a transfer transaction", async function () {
//       const [owner, otherAccount, anotherAccount, moreAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

//       // deposit tokens into contract
//       const depositAmount = ethers.parseUnits("500", 18);
//       await token.transfer(multisig, depositAmount);

//       // create transfer transaction
//       const transferAmount = ethers.parseUnits("100", 18);

//       const transferTx = await multisig.transfer(
//         transferAmount,
//         otherAccount,
//         token
//       );
//       await transferTx.wait();

//       expect(await multisig.txCount()).to.be.equal(1);
//       expect(await multisig.txCount()).to.be.greaterThanOrEqual(1);
//     });
//   });

//   describe("approve transfer transaction", function() {
//     it("should successfully approve transaction a valid signers", async function() {
//       const [owner, otherAccount, anotherAccount, moreAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

//       // deposit tokens into contract
//       const depositAmount = ethers.parseUnits("500", 18);
//       await token.transfer(multisig, depositAmount);

//       // create transfer transaction
//       const transferAmount = ethers.parseUnits("100", 18);

//       const transferTx = await multisig.transfer(
//         transferAmount,
//         otherAccount,
//         token
//       );
//       await transferTx.wait();

//       await multisig.connect(otherAccount).approveTx(1);      
//     })

//     it("should revert approve transaction if a signer tries to wign twice", async function() {
//       const [owner, otherAccount, anotherAccount, moreAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

//       // deposit tokens into contract
//       const depositAmount = ethers.parseUnits("500", 18);
//       await token.transfer(multisig, depositAmount);

//       // create transfer transaction
//       const transferAmount = ethers.parseUnits("100", 18);

//       const transferTx = await multisig.transfer(
//         transferAmount,
//         otherAccount,
//         token
//       );
//       await transferTx.wait();

//       expect(multisig.approveTx(1)).to.be.revertedWith("can't sign twice");      
//     })

//     it("should revert approve transaction for an invalid signer", async function() {
//       const [owner, otherAccount, anotherAccount, moreAccount, invalidAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

//       // deposit tokens into contract
//       const depositAmount = ethers.parseUnits("500", 18);
//       await token.transfer(multisig, depositAmount);

//       // create transfer transaction
//       const transferAmount = ethers.parseUnits("100", 18);

//       const transferTx = await multisig.transfer(
//         transferAmount,
//         otherAccount,
//         token
//       );
//       await transferTx.wait();

//       expect(multisig.connect(invalidAccount).approveTx(1));
//     })

//     it("should revert approve transaction for an invalid txId", async function() {
//       const [owner, otherAccount, anotherAccount, moreAccount, invalidAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

//       // deposit tokens into contract
//       const depositAmount = ethers.parseUnits("500", 18);
//       await token.transfer(multisig, depositAmount);

//       // create transfer transaction
//       const transferAmount = ethers.parseUnits("100", 18);

//       const transferTx = await multisig.transfer(
//         transferAmount,
//         otherAccount,
//         token
//       );
//       await transferTx.wait();

//       expect(multisig.approveTx(0)).to.be.revertedWith("invalid tx id")
//     })

//     it("should successfully complete transaction whe quorum is reached for transfer and update balance of recipient", async function() {
//       const [owner, otherAccount, anotherAccount, moreAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

//       // deposit tokens into contract
//       const depositAmount = ethers.parseUnits("500", 18);
//       await token.transfer(multisig, depositAmount);

//       // create transfer transaction
//       const transferAmount = ethers.parseUnits("100", 18);

//       const transferTx = await multisig.transfer(
//         transferAmount,
//         otherAccount,
//         token
//       );
//       await transferTx.wait();

//       await multisig.connect(otherAccount).approveTx(1);
//       await multisig.connect(anotherAccount).approveTx(1);
      
//       const newOtherAccountBalace = await token.balanceOf(otherAccount);
      
//       expect(newOtherAccountBalace).to.be.equal(transferAmount);
//     })
//   })

//   describe("update quorum transaction", function () {
//     it("should successfully create update quorum transaction", async function () {
//       const [owner, otherAccount, anotherAccount, moreAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

//       // deposit tokens into contract
//       const depositAmount = ethers.parseUnits("500", 18);
//       await token.transfer(multisig, depositAmount);

//       // create transfer transaction
//       const transferAmount = ethers.parseUnits("100", 18);

//       const transferTx = await multisig.transfer(
//         transferAmount,
//         otherAccount,
//         token
//       );

//       await transferTx.wait();

//       // create transfer transaction
//       const newQuorum = 4;
//       const updateQuorumTx = await multisig.updateQuorum(newQuorum);
//       await updateQuorumTx.wait();

//       expect(await multisig.txCount()).to.be.equal(2);
//     });

//     it("should revert if quorum is greater then valid signers", async function () {
//       const { multisig } = await loadFixture(deployMultisig);

//       const newQuorum = 5;
//       expect(multisig.updateQuorum(newQuorum)).to.be.revertedWith("quorum greater than valid signers");
//     });
//   });

//   describe("approve update quorum transaction", function () {
//     it("should successfully approve update quorum transaction for a valid signer", async function() {
//       const [owner, otherAccount, anotherAccount, moreAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

//       const updateQuorumTx = await multisig.updateQuorum(2);

//       await multisig.connect(otherAccount).approveQuorumUpdateTx(1);      
//     })

//     it("should revert approve update quorum transaction if a signer tries to sign twice", async function() {
//       const [owner, otherAccount, anotherAccount, moreAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);


//       const updateQuorumTx = await multisig.updateQuorum(2);

//       await multisig.connect(otherAccount).approveQuorumUpdateTx(1);

//       expect(multisig.approveQuorumUpdateTx(1)).to.be.revertedWith("can't sign twice");      
//     })

//     it("should revert approve update quorum transaction for an invalid signer", async function() {
//       const [owner, otherAccount, anotherAccount, moreAccount, invalidAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

      
//       const updateQuorumTx = await multisig.updateQuorum(2);

//       await multisig.connect(otherAccount).approveQuorumUpdateTx(1);

//       expect(multisig.connect(invalidAccount).approveQuorumUpdateTx(1));
//     })

//     it("should revert approve update quorum transaction for an invalid txId", async function() {
//       const [owner, otherAccount, anotherAccount, moreAccount, invalidAccount] = await ethers.getSigners();

//       const { multisig, token } = await loadFixture(deployMultisig);

      
//       const updateQuorumTx = await multisig.updateQuorum(2);

//       await multisig.connect(otherAccount).approveQuorumUpdateTx(1);

//       expect(multisig.approveQuorumUpdateTx(0)).to.be.revertedWith("invalid tx id")
//     })

//     it("should successfully complete update quorum transaction whe quorum is reached for update quorum transaction and update quorum", async function() {
//       const [owner, otherAccount, anotherAccount ] = await ethers.getSigners();

//       const { multisig } = await loadFixture(deployMultisig);


//       const updateQuorumTx = await multisig.updateQuorum(2);

//       await multisig.connect(otherAccount).approveQuorumUpdateTx(1);
//       await multisig.connect(anotherAccount).approveQuorumUpdateTx(1);
      
//       expect(await multisig.quorum()).to.be.equal(2);
//     })
//   });
// });