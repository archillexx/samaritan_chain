// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// DonationContract.sol
// Acts as the escrow for all donated funds.
// Only the AllocationContract can trigger fund releases.

contract DonationContract {

    address public admin;
    address public allocationContract;

    mapping(address => uint256) public donorContributions;

    event DonationReceived(address indexed donor, uint256 amount);
    event FundsReleased(address indexed charity, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyAllocation() {
        require(msg.sender == allocationContract, "Only AllocationContract can release funds");
        _;
    }

    // Called after AllocationContract is deployed
    function setAllocationContract(address _allocation) external onlyAdmin {
        allocationContract = _allocation;
    }

    // Any donor can contribute ETH
    function donate() external payable {
        require(msg.value > 0, "Must send some ETH");
        donorContributions[msg.sender] += msg.value;
        emit DonationReceived(msg.sender, msg.value);
    }

    // Only AllocationContract can call this to pay a charity
   function releaseFunds(address payable _charity, uint256 _amount) external onlyAllocation {
    require(_amount <= address(this).balance, "Not enough funds in escrow");

    (bool success, ) = _charity.call{value: _amount}("");
    require(success, "Transfer failed");

    emit FundsReleased(_charity, _amount);
}


    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
