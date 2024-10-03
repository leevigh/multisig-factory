// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Multisig {
    /**
     * A multisig is a wallet that allows 
     * multiple users to sign a transaction before it is initiated
     * 
     * This wallet can handle multiple transactions
     * 
     * Quorum is the number of people that must sign a transaction 
     * 
     * A variable to hold the identities of people authorized to sign the transaction
     */
    uint8 public quorum;
    uint8 public noOfValidSigners;
    uint256 public txCount; // transaction count to use in creating the id for the transactions
    uint256 public qTxCount; // to track quorum transaction Id

    struct Transaction {
        uint256 id;
        uint256 amount;
        address sender;
        address recipient;
        bool isCompleted;
        uint256 timestamp;
        uint256 noOfApproval;
        address tokenAddress;
        address[] transactionSigners;
    }

    struct QuorumUpdateTransaction {
        uint256 noOfApproval;
        address[] transactionSigners;
        uint256 timestamp;
        bool isApproved;
        uint8 newQuorum;
    }

    mapping(address => bool) isValidSigner;
    mapping(uint => Transaction) public transactions; // txId -> Transactions
    mapping(uint => QuorumUpdateTransaction) public quorumTransactions; // qTxId -> QuorumUpdateTransactions
    // signer -> transactionId -> bool (checking if an address has signed)
    mapping(address => mapping(uint256 => bool)) public hasSigned;
    mapping(address => mapping(uint256 => bool)) public hasSignedQuorumUpdate;
    // mapping(uint => bool) isValidTx; // txId -> bool (checks if a tx id is valid)
    // mapping(uint => address[]) transactionSigners; // txId -> array of transaction signers

    constructor(uint8 _quorum, address[] memory _validSigners) {
        require(_validSigners.length > 1, "few valid signers");
        require(_quorum > 1, "quorum is too small");
        

        for(uint256 i = 0; i < _validSigners.length; i++) {
            require(_validSigners[i] != address(0), "zero address not allowed");
            require(!isValidSigner[_validSigners[i]], "signer already exists");

            isValidSigner[_validSigners[i]] = true;

            // noOfValidSigners += 1;
        }

        

        noOfValidSigners = uint8(_validSigners.length);

        if(!isValidSigner[msg.sender]) {
            isValidSigner[msg.sender] = true;
            noOfValidSigners += 1;
        }

        require(_quorum <= _validSigners.length, "quorum greater than valid signers");
        quorum = _quorum;
    }

    function transfer(uint256 _amount, address _recipient, address _tokenAddress) external {
        require(msg.sender != address(0), "address zero found");
        require(isValidSigner[msg.sender], "invalid signer");
        require(_amount > 0, "can't send zero amount");

        require(_recipient != address(0), "address zero found");
        require(_tokenAddress != address(0), "address zero found");

        require(IERC20(_tokenAddress).balanceOf(address(this)) >= _amount, "insufficient funds");

        uint256 _txId = txCount + 1;

        Transaction storage trx = transactions[_txId];
        trx.id = _txId;
        trx.amount = _amount;
        trx.recipient = _recipient;
        trx.sender = msg.sender;
        trx.timestamp = block.timestamp;
        trx.tokenAddress = _tokenAddress;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);

        hasSigned[msg.sender][_txId] = true;

        txCount += 1;

        // transactionSigners[txId].push(msg.sender);
    }

    function approveTx(uint _txId) external {
        Transaction storage trx = transactions[_txId];

        require(IERC20(trx.tokenAddress).balanceOf(address(this)) >= trx.amount, "insufficient funds");

        require(trx.id != 0, "Invalid tx id");
        require(!trx.isCompleted, "transaction already completed");
        require(trx.noOfApproval < quorum, "approvals already reached");

        require(isValidSigner[msg.sender], "not a valid signer");
        require(!hasSigned[msg.sender][_txId], "can't sign twice");

        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);
        hasSigned[msg.sender][_txId] = true;

        if(trx.noOfApproval == quorum) {
            trx.isCompleted = true;
            IERC20(trx.tokenAddress).transfer(trx.recipient, trx.amount);
        }

        //Loop to check if a signer has signed
        // for(uint256 i = 0; i<trx.transactionSigners.length; i++) {
        //     if(trx.transactionSigners[i] == msg.sender) {
        //         revert("can't sign twice");
        //     }
        // }
    }

    function approveUpdateTx(uint _qTxId) external {
        QuorumUpdateTransaction storage qTrx = quorumTransactions[_qTxId];


        require(_qTxId != 0, "Invalid tx id");
        require(!qTrx.isApproved, "transaction already approved");
        require(qTrx.noOfApproval < quorum, "approvals already reached");

        require(isValidSigner[msg.sender], "not a valid signer");
        require(!hasSignedQuorumUpdate[msg.sender][_qTxId], "can't sign twice");

        qTrx.noOfApproval += 1;
        qTrx.transactionSigners.push(msg.sender);
        hasSignedQuorumUpdate[msg.sender][_qTxId] = true;

        if(qTrx.noOfApproval == quorum) {
            qTrx.isApproved = true;
            quorum = qTrx.newQuorum;
        }
    }

    function withdraw(uint256 _amount, address _tokenAddress) external {

    }

    function updateQuorum(uint8 _newQuorum) external {
        require(_newQuorum > 1, "quorum is too small");
        require(_newQuorum <= noOfValidSigners, "quorum greater than valid signers");
        require(msg.sender != address(0), "address zero found");
        require(isValidSigner[msg.sender], "invalid signer");

        uint256 _qTxId = qTxCount + 1;

        QuorumUpdateTransaction storage qTx = quorumTransactions[_qTxId];

        qTx.transactionSigners.push(msg.sender);
        qTx.timestamp = block.timestamp;
        qTx.newQuorum = _newQuorum;

        hasSignedQuorumUpdate[msg.sender][_qTxId] = true;
        qTxCount += 1;
    }
}
