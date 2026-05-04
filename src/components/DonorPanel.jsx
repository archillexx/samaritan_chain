import { useState } from 'react';
import { ethers } from 'ethers';

export default function DonorPanel({ contracts, account }) {
  const [ethAmount, setEthAmount] = useState('0.1');
  const [proposalId, setProposalId] = useState('0');
  const [status, setStatus] = useState('');

  async function registerDonor() {
    try {
      setStatus('Registering...');
      const tx = await contracts.voting.registerAsDonor();
      await tx.wait();
      setStatus('Registered as donor successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function donate() {
    try {
      setStatus('Donating...');
      const tx = await contracts.donation.donate({ value: ethers.parseEther(ethAmount || '0') });
      await tx.wait();
      setStatus('Donation sent successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function vote(support) {
    try {
      setStatus(`Voting ${support ? 'FOR' : 'AGAINST'}...`);
      const tx = await contracts.voting.vote(proposalId, support);
      await tx.wait();
      setStatus('Vote cast successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
      <h2>Donor Panel</h2>
      <p style={{ color: 'blue' }}>{status}</p>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={registerDonor}>Register as Donor</button>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Donation Amount (ETH): </label>
        <input type="text" value={ethAmount} onChange={(e) => setEthAmount(e.target.value)} />
        <button onClick={donate}>Donate</button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Proposal ID: </label>
        <input type="text" value={proposalId} onChange={(e) => setProposalId(e.target.value)} />
        <button onClick={() => vote(true)}>Vote FOR</button>
        <button onClick={() => vote(false)}>Vote AGAINST</button>
      </div>
    </div>
  );
}
