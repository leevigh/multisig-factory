import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";
  
  describe("Multisig", function () {
    async function deployMultisig() {
  
      // Contracts are deployed using the first signer/account by default
      const [owner, addr1, addr2, addr3, addr4] = await hre.ethers.getSigners();

      const quorumNo = 3;
      const validSigners = [owner, addr1, addr2, addr3];
  
      const Multisig = await hre.ethers.getContractFactory("Multisig");
      const multisig = await Multisig.deploy(quorumNo, validSigners);
  
      return { multisig, quorumNo, validSigners, addr1, addr2, addr3, addr4, owner };
    }

    async function deployToken() {
        // Contracts are deployed using the first signer/account by default
        const [owner, addr1] = await hre.ethers.getSigners();
    
        const erc20Token = await hre.ethers.getContractFactory("Web3CXI");
        const token = await erc20Token.deploy();
    
        return { token };
    }
  
    describe("Deployment", function () {
      it("Should set the right quorum and validSigners", async function () {
        const { multisig, validSigners } = await loadFixture(deployMultisig);
  
        expect(await multisig.quorum()).to.be.lessThanOrEqual(validSigners.length);
      });

      it("Should deploy with the right number of quorum and valid signers", async function () {
        const { multisig } = await loadFixture(deployMultisig);
        expect(await multisig.quorum()).to.equal(3);
        expect(await multisig.noOfValidSigners()).to.be.equal(4);
      })

      it("Should revert for zero address signers", async function() {
        // In this test, deploy the contract again to test for this case
        // const { multisig } = await loadFixture(deployMultisig); // mistake attempt
        const Multisig = await hre.ethers.getContractFactory("Multisig"); // correct approach

        // deploy the contract again to test for the case in the expect
        expect(Multisig.deploy(3, [ethers.ZeroAddress])).to.be.revertedWith("zero address not allowed");
      })

      it("Should revert if valid signer exists already", async function() {
        const { owner, addr1 } = await loadFixture(deployMultisig);
        const Multisig = await hre.ethers.getContractFactory("Multisig");

        Multisig.deploy(3, [owner, addr1]);

        expect(Multisig.deploy(3, [owner, addr1])).to.be.revertedWith("signer already exists");
      })
    });
  
    describe("Transfer", function () {
      describe("Validations", function () {

        it("Should revert on zero transfer", async function () {
            const { multisig, owner, addr1 } = await loadFixture(deployMultisig);
      
            // const depositAmount = ethers.parseUnits("0", 18);
      
            await expect(
              multisig.transfer(0, addr1, "0xaDBA987955Eac146f1983062100046be46e632fA")
            ).to.be.revertedWith("can't send zero amount");
        });

        it("Should revert on zero recipient address and token address", async function() {
          const { multisig, owner, addr1 } = await loadFixture(deployMultisig);

          const trfAmount = ethers.parseUnits("100", 18);
          await expect(multisig.transfer(trfAmount, ethers.ZeroAddress, "0xaDBA987955Eac146f1983062100046be46e632fA")).to.be.revertedWith("address zero found");
          await expect(multisig.transfer(trfAmount, addr1, ethers.ZeroAddress)).to.be.revertedWith("address zero found");
        })

        it("Should transfer successfully", async function () {
            const { multisig, owner, addr1 } = await loadFixture(deployMultisig);
            const { token } = await loadFixture(deployToken);

            // Transfer some amount of token to contract first
            const depositAmount = ethers.parseUnits("150", 18);
            await token.transfer(multisig, depositAmount);
      
            // Transfer erc20 tokens from the owner to otherAccount
            const trfAmount = ethers.parseUnits("100", 18);
            (await multisig.transfer(trfAmount, addr1, token.getAddress())).wait();

            // expect that transaction count increased
            expect(await multisig.txCount()).to.be.equal(1);

            // expect that transaction count is greater than or equal to 1
            expect(await multisig.txCount()).to.be.greaterThanOrEqual(1);

        });

        it("Should revert on insufficient balance", async function () {
          const { multisig, owner, addr1, addr2 } = await loadFixture(deployMultisig);
          const erc20Token = await hre.ethers.getContractFactory("Web3CXI");
          const token = await erc20Token.deploy();

          const trfAmount = ethers.parseUnits("100", 18);

          await expect(multisig.connect(addr2).transfer(trfAmount, addr1, token.getAddress())).to.be.revertedWith("insufficient funds");
        })
      });
    });

    describe("Approve Transaction", function () {
      it("Should approve a transfer transaction", async function() {
        const { multisig, addr1, addr2, addr3 } = await loadFixture(deployMultisig);
        const token = await hre.ethers.getContractFactory("Web3CXI");
        const erc20 = await token.deploy();

        await erc20.transfer(multisig.getAddress(), 1000); // Fund multisig

        // simulate a transfer transaction
        await multisig.connect(addr1).transfer(500, addr3, erc20.getAddress());
        await multisig.connect(addr2).approveTx(1); // Approve transaction
        
        const tx = await multisig.transactions(1);
        expect(tx.isCompleted).to.equal(true);
      })

      it("Should revert if signer tries to approve twice", async function() {
        const { multisig, addr1, addr2, addr3 } = await loadFixture(deployMultisig);
        const token = await hre.ethers.getContractFactory("Web3CXI");
        const erc20 = await token.deploy();

        await erc20.transfer(multisig.getAddress(), 1000); // Fund multisig

        // simulate a transfer transaction
        await multisig.connect(addr1).transfer(500, addr3, erc20.getAddress());
        await multisig.connect(addr2).approveTx(1); // Approve transaction

        await multisig.connect(addr2).approveTx(1);
        // can't sign twice
        // await expect(multisig.connect(addr2).approveTx(1)).to.be.revertedWith("can't sign twice");
        expect(await multisig.connect(addr2).hasSigned(addr2, 1)).to.be.revertedWith("can't sign twice");
      })
    })

    // describe("Update Quorum", function () {
    //     it("Should update transaction without changing quorum", async function() {
    //         const { multisig, owner, addr1 } = await loadFixture(deployMultisig);

    //         await multisig.updateQuorum(4)

    //         expect(await multisig.qTxCount()).to.be.equal(1);
    //         expect(await multisig.qTxCount()).to.be.greaterThanOrEqual(1);
    //         expect((await multisig.quorumTransactions(1)).isApproved).to.be.false;
    //     })

    //     it("Should approve update quorum transaction", async function() {
    //         const { multisig, owner, addr1 } = await loadFixture(deployMultisig);

    //         // const currentQuorum = await multisig.quorum();
    //         await multisig.updateQuorum(4);

    //         // const noOfApprovalAfter = (await multisig.quorumTransactions(1)).noOfApproval += 1;

    //         await (await multisig.connect(addr1).approveUpdateTx(1)).wait();

    //         // expect(await multisig.quorumTransactions(1).)
    //         // expect(await multisig.qTxCount()).to.be.equal(1);
    //         // expect(await multisig.qTxCount()).to.be.greaterThanOrEqual(1);
    //         // expect((await multisig.quorumTransactions(1)).isApproved).to.be.true;
    //         // expect(multisig.connect(owner).hasSignedQuorumUpdate).to.be.true;

    //     })

    //     it("Should revert if signer tries to approve update quorum transaction twice", async function() {
    //       const { multisig, owner, addr1 } = await loadFixture(deployMultisig);

    //       // const currentQuorum = await multisig.quorum();
    //       await multisig.updateQuorum(4);

    //       // const noOfApprovalAfter = (await multisig.quorumTransactions(1)).noOfApproval += 1;

    //       (await multisig.connect(addr1).approveUpdateTx(1));

    //       expect(await multisig.approveUpdateTx(1)).to.be.revertedWith("can't sign twice");

    //     })
    // })
  });
  