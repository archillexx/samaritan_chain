import { ethers } from 'ethers';

export function shortAddress(address = '') {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEth(value) {
  try {
    return `${ethers.formatEther(value)} ETH`;
  } catch {
    return '0 ETH';
  }
}

export function formatDate(timestamp) {
  const n = Number(timestamp);
  if (!n) return 'N/A';
  return new Date(n * 1000).toLocaleString();
}

export function parseError(error) {
  return (
    error?.revert?.args?.[0] ||
    error?.reason ||
    error?.shortMessage ||
    error?.message ||
    'Something went wrong'
  );
}
