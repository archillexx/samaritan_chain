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
    <section className="card">
      <div className="cardHeader">
        <h2>Donor Panel</h2>
        <p>Register, donate funds, and vote on charitable proposals.</p>
      </div>

      {status && <p className="ok" style={{ marginBottom: '16px' }}>{status}</p>}
      
      <div style={{ marginBottom: '24px' }}>
        <button className="secondary" onClick={registerDonor}>Register as Donor</button>
      </div>
      
      <hr />

      <label className="field">
        <span>Donation Amount (ETH)</span>
        <input type="text" value={ethAmount} onChange={(e) => setEthAmount(e.target.value)} />
      </label>
      <button onClick={donate} style={{ marginBottom: '24px' }}>Donate</button>

      <hr />

      <label className="field">
        <span>Proposal ID to Vote On</span>
        <input type="text" value={proposalId} onChange={(e) => setProposalId(e.target.value)} />
      </label>
      <div className="row">
        <button onClick={() => vote(true)}>Vote FOR</button>
        <button className="secondary" onClick={() => vote(false)}>Vote AGAINST</button>
      </div>
    </section>
  );
}
