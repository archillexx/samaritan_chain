// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AllocationContract.sol";

// VotingContract.sol
// Analysts submit proposals to add charities or adjust fund percentages.
// Donors vote on proposals. Once voting closes, anyone can execute
// the result which automatically updates AllocationContract.

contract VotingContract {

    address public admin;
    AllocationContract public allocationContract;

    // Voting period - set short for MVP demo purposes (1 hour)
    // In production this would be 7 days
    uint256 public votingPeriod = 1 minutes;

    enum ProposalType { ADD_CHARITY, UPDATE_PERCENTAGE }

    struct Proposal {
        ProposalType  proposalType;
        string        charityName;
        address payable charityWallet;
        uint256       charityId;     // used for UPDATE_PERCENTAGE proposals
        uint256       percentage;
        uint256       votesFor;
        uint256       votesAgainst;
        uint256       deadline;
        bool          executed;
        address       proposer;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    mapping(address => bool) public isAnalyst;
    mapping(address => bool) public isDonor;

    // Track who has already voted on each proposal
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event AnalystRegistered(address analyst);
    event DonorRegistered(address donor);
    event ProposalSubmitted(uint256 indexed id, address proposer, ProposalType pType, string charityName);
    event VoteCast(uint256 indexed proposalId, address voter, bool support);
    event ProposalExecuted(uint256 indexed id, bool passed);

    constructor(address _allocationContract) {
        admin = msg.sender;
        allocationContract = AllocationContract(_allocationContract);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAnalyst() {
        require(isAnalyst[msg.sender], "Not a registered analyst");
        _;
    }

    modifier onlyDonor() {
        require(isDonor[msg.sender], "Not a registered donor");
        _;
    }

    // Admin registers trusted analysts (NGOs, researchers)
    function registerAnalyst(address _analyst) external onlyAdmin {
        isAnalyst[_analyst] = true;
        emit AnalystRegistered(_analyst);
    }

    // Donors self-register (open participation)
    function registerAsDonor() external {
        isDonor[msg.sender] = true;
        emit DonorRegistered(msg.sender);
    }

    // Analyst proposes adding a new charity to the platform
    function proposeAddCharity(
        string calldata _name,
        address payable _wallet,
        uint256 _percentage
    ) external onlyAnalyst {
        require(_percentage > 0 && _percentage <= 100, "Percentage must be 1-100");

        proposals[proposalCount] = Proposal({
            proposalType:  ProposalType.ADD_CHARITY,
            charityName:   _name,
            charityWallet: _wallet,
            charityId:     0,
            percentage:    _percentage,
            votesFor:      0,
            votesAgainst:  0,
            deadline:      block.timestamp + votingPeriod,
            executed:      false,
            proposer:      msg.sender
        });

        emit ProposalSubmitted(proposalCount, msg.sender, ProposalType.ADD_CHARITY, _name);
        proposalCount++;
    }

    // Analyst proposes changing a charity's fund percentage
    function proposeUpdatePercentage(
        uint256 _charityId,
        uint256 _newPercentage
    ) external onlyAnalyst {
        require(_newPercentage > 0 && _newPercentage <= 100, "Invalid percentage");

        proposals[proposalCount] = Proposal({
            proposalType:  ProposalType.UPDATE_PERCENTAGE,
            charityName:   "",
            charityWallet: payable(address(0)),
            charityId:     _charityId,
            percentage:    _newPercentage,
            votesFor:      0,
            votesAgainst:  0,
            deadline:      block.timestamp + votingPeriod,
            executed:      false,
            proposer:      msg.sender
        });

        emit ProposalSubmitted(proposalCount, msg.sender, ProposalType.UPDATE_PERCENTAGE, "");
        proposalCount++;
    }

    // Donors cast their vote on an open proposal
    function vote(uint256 _proposalId, bool _support) external onlyDonor {
        Proposal storage p = proposals[_proposalId];
        require(block.timestamp < p.deadline, "Voting period has ended");
        require(!hasVoted[_proposalId][msg.sender], "You have already voted");

        hasVoted[_proposalId][msg.sender] = true;

        if (_support) {
            p.votesFor++;
        } else {
            p.votesAgainst++;
        }

        emit VoteCast(_proposalId, msg.sender, _support);
    }

    // Anyone can finalise a proposal once the deadline has passed
    // If it passed, the result is pushed directly to AllocationContract
    function executeProposal(uint256 _proposalId) external {
        Proposal storage p = proposals[_proposalId];
        require(block.timestamp >= p.deadline, "Voting still open");
        require(!p.executed, "Already executed");

        p.executed = true;
        bool passed = p.votesFor > p.votesAgainst;

        if (passed) {
            if (p.proposalType == ProposalType.ADD_CHARITY) {
                allocationContract.addCharity(p.charityName, p.charityWallet, p.percentage);
            } else {
                allocationContract.updatePercentage(p.charityId, p.percentage);
            }
        }

        emit ProposalExecuted(_proposalId, passed);
    }

    function getProposal(uint256 _id) external view returns (
        string memory, uint256, uint256, uint256, bool, bool
    ) {
        Proposal storage p = proposals[_id];
        bool isOpen = block.timestamp < p.deadline;
        return (p.charityName, p.votesFor, p.votesAgainst, p.deadline, p.executed, isOpen);
    }
}
