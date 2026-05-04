import { useState } from 'react';
import { ethers } from 'ethers';

export default function DashboardPanel({ contracts, account }) {
  const [balance, setBalance] = useState('0');
  const [contribution, setContribution] = useState('0');
  const [proposalCount, setProposalCount] = useState('0');
  const [charityCount, setCharityCount] = useState('0');
  const [submissionCount, setSubmissionCount] = useState('0');
  const [error, setError] = useState('');

  async function refresh() {
    try {
      setError('');
      const [b, p, c, s] = await Promise.all([
        contracts.donation.getBalance(),
        contracts.voting.proposalCount(),
        contracts.allocation.charityCount(),
        contracts.delivery.submissionCount(),
      ]);
      
      setBalance(ethers.formatEther(b));
      setProposalCount(p.toString());
      setCharityCount(c.toString());
      setSubmissionCount(s.toString());

      if (account) {
        const mine = await contracts.donation.donorContributions(account);
        setContribution(ethers.formatEther(mine));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
      <h2>Dashboard</h2>
      <button onClick={refresh}>Refresh Data</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <ul>
        <li>Escrow Balance: {balance} ETH</li>
        <li>Your Contributions: {contribution} ETH</li>
        <li>Total Proposals: {proposalCount}</li>
        <li>Total Charities: {charityCount}</li>
        <li>Proof Submissions: {submissionCount}</li>
      </ul>
    </div>
  );
}
