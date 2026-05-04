import DonationABI from '../abi/DonationContract.json';
import AllocationABI from '../abi/AllocationContract.json';
import VotingABI from '../abi/VotingContract.json';
import DeliveryABI from '../abi/DeliveryContract.json';

export const CONTRACTS = {
  donation: {
    label: 'DonationContract',
    storageKey: 'samaritan_donation_address',
    abi: DonationABI,
  },
  allocation: {
    label: 'AllocationContract',
    storageKey: 'samaritan_allocation_address',
    abi: AllocationABI,
  },
  voting: {
    label: 'VotingContract',
    storageKey: 'samaritan_voting_address',
    abi: VotingABI,
  },
  delivery: {
    label: 'DeliveryContract',
    storageKey: 'samaritan_delivery_address',
    abi: DeliveryABI,
  },
};

export function getSavedAddresses() {
  return Object.fromEntries(
    Object.entries(CONTRACTS).map(([key, config]) => [
      key,
      localStorage.getItem(config.storageKey) || '',
    ])
  );
}

export function saveAddresses(addresses) {
  Object.entries(CONTRACTS).forEach(([key, config]) => {
    localStorage.setItem(config.storageKey, addresses[key] || '');
  });
}
