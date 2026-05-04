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
    <section className="card">
      <div className="cardHeader">
        <h2>Dashboard</h2>
        <p>Live metrics from the Samaritan smart contracts.</p>
      </div>
      
      {error && <p className="warn" style={{ marginBottom: '16px' }}>{error}</p>}
      
      <div className="stats">
        <div className="statCard"><strong>{balance} ETH</strong><span>Escrow Balance</span></div>
        <div className="statCard"><strong>{contribution} ETH</strong><span>Your Contributions</span></div>
        <div className="statCard"><strong>{proposalCount}</strong><span>Total Proposals</span></div>
        <div className="statCard"><strong>{charityCount}</strong><span>Total Charities</span></div>
        <div className="statCard"><strong>{submissionCount}</strong><span>Proof Submissions</span></div>
      </div>

      <button className="secondary" onClick={refresh}>Refresh Data</button>
    </section>
  );
}
