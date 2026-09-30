// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DonationContract.sol";

// AllocationContract.sol
// Keeps track of which charities are approved and what percentage of
// the fund each one receives. Only VotingContract can modify records.
// Only DeliveryContract can trigger a distribution.

contract AllocationContract {

    address public admin;
    DonationContract public donationContract;
    address public votingContract;
    address public deliveryContract;

    struct Charity {
        string  name;
        address payable wallet;
        uint256 percentage; // out of 100, e.g. 20 = 20%
        bool    active;
    }

    mapping(uint256 => Charity) public charities;
    uint256 public charityCount;

    event CharityAdded(uint256 indexed id, string name, uint256 percentage);
    event PercentageUpdated(uint256 indexed charityId, uint256 newPercentage);
    event FundsDistributed(uint256 indexed charityId, address wallet, uint256 amount);

    constructor(address _donationContract) {
        admin = msg.sender;
        donationContract = DonationContract(_donationContract);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyVoting() {
        require(msg.sender == votingContract, "Only VotingContract");
        _;
    }

    modifier onlyDelivery() {
        require(msg.sender == deliveryContract, "Only DeliveryContract");
        _;
    }

    function setVotingContract(address _voting) external onlyAdmin {
        votingContract = _voting;
    }

    function setDeliveryContract(address _delivery) external onlyAdmin {
        deliveryContract = _delivery;
    }

    // Called by VotingContract once a proposal passes
    function addCharity(
        string calldata _name,
        address payable _wallet,
        uint256 _percentage
    ) external onlyVoting {
        charities[charityCount] = Charity({
            name:       _name,
            wallet:     _wallet,
            percentage: _percentage,
            active:     true
        });
        emit CharityAdded(charityCount, _name, _percentage);
        charityCount++;
    }

    // Called by VotingContract once an update proposal passes
    function updatePercentage(uint256 _charityId, uint256 _newPercentage) external onlyVoting {
        require(charities[_charityId].active, "Charity not active");
        charities[_charityId].percentage = _newPercentage;
        emit PercentageUpdated(_charityId, _newPercentage);
    }

    // Called by DeliveryContract after proof is validated
    // Calculates this charity's share and tells DonationContract to release it
    function distributeToCharity(uint256 _charityId) external onlyDelivery {
        Charity storage c = charities[_charityId];
        require(c.active, "Charity is not active");

        uint256 balance = donationContract.getBalance();
        uint256 amount  = (balance * c.percentage) / 100;
        require(amount > 0, "Nothing to distribute");

        donationContract.releaseFunds(c.wallet, amount);
        emit FundsDistributed(_charityId, c.wallet, amount);
    }

    function getCharity(uint256 _id) external view returns (string memory, address, uint256, bool) {
        Charity storage c = charities[_id];
        return (c.name, c.wallet, c.percentage, c.active);
    }
}
