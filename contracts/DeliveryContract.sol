// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AllocationContract.sol";

// DeliveryContract.sol
// Registered charities submit proof of their charitable actions.
// The admin (representing the analyst network) validates the submission.
// Once accepted, AllocationContract is triggered to release funds.

contract DeliveryContract {

    address public admin;
    AllocationContract public allocationContract;

    struct Submission {
        uint256 charityId;
        address submittedBy;
        string  evidenceURI;  // e.g. IPFS hash or description for MVP
        bool    validated;
        bool    rejected;
        uint256 submittedAt;
    }

    mapping(uint256 => Submission) public submissions;
    uint256 public submissionCount;

    // Only registered charity wallets can submit proof
    mapping(address => bool) public isRegisteredCharity;

    event CharityRegistered(address charity);
    event ProofSubmitted(uint256 indexed submissionId, uint256 charityId, address charity);
    event ProofValidated(uint256 indexed submissionId, bool accepted);

    constructor(address _allocationContract) {
        admin = msg.sender;
        allocationContract = AllocationContract(_allocationContract);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyCharity() {
        require(isRegisteredCharity[msg.sender], "Not a registered charity");
        _;
    }

    // Admin registers a charity wallet so they can submit proof
    function registerCharity(address _charity) external onlyAdmin {
        isRegisteredCharity[_charity] = true;
        emit CharityRegistered(_charity);
    }

    // Charity submits evidence of their work (IPFS hash / description)
    function submitProof(uint256 _charityId, string calldata _evidenceURI) external onlyCharity {
        submissions[submissionCount] = Submission({
            charityId:   _charityId,
            submittedBy: msg.sender,
            evidenceURI: _evidenceURI,
            validated:   false,
            rejected:    false,
            submittedAt: block.timestamp
        });

        emit ProofSubmitted(submissionCount, _charityId, msg.sender);
        submissionCount++;
    }

    // Admin (analyst network) reviews and validates or rejects the submission
    // If accepted, funds are released via AllocationContract -> DonationContract
    function validateProof(uint256 _submissionId, bool _accepted) external onlyAdmin {
        Submission storage s = submissions[_submissionId];
        require(!s.validated && !s.rejected, "Already processed");

        if (_accepted) {
            s.validated = true;
            // Cross-contract call: AllocationContract -> DonationContract
            allocationContract.distributeToCharity(s.charityId);
        } else {
            s.rejected = true;
        }

        emit ProofValidated(_submissionId, _accepted);
    }

    function getSubmission(uint256 _id) external view returns (
        uint256, address, string memory, bool, bool
    ) {
        Submission storage s = submissions[_id];
        return (s.charityId, s.submittedBy, s.evidenceURI, s.validated, s.rejected);
    }
}
