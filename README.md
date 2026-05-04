# Samaritan Chain React dApp

React + Vite frontend for the four-contract Samaritan Chain project:

- DonationContract
- AllocationContract
- VotingContract
- DeliveryContract

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

## Deployment flow

Deploy your Solidity contracts in Remix in this order:

1. `DonationContract` — no constructor args
2. `AllocationContract` — constructor arg: DonationContract address
3. `VotingContract` — constructor arg: AllocationContract address
4. `DeliveryContract` — constructor arg: AllocationContract address

Then paste the four deployed addresses into the app and connect MetaMask.

You can click **Wire Contracts Together** from the admin panel, or manually call:

```text
DonationContract.setAllocationContract(AllocationContract address)
AllocationContract.setVotingContract(VotingContract address)
AllocationContract.setDeliveryContract(DeliveryContract address)
```

## Important

Use the deployer wallet for admin actions:

- Wire contracts
- Register analyst
- Register charity
- Validate proof

Use different MetaMask accounts to demo roles:

- Admin/deployer
- Analyst
- Donor 1
- Donor 2
- Charity wallet

## Notes

This app uses ethers v6, so the provider is created with:

```js
new ethers.BrowserProvider(window.ethereum)
```
