import { useState } from 'react';
import { ethers } from 'ethers';
import { useToast } from './Toast';

export default function DonorPanel({ contracts, account }) {
  const [ethAmount, setEthAmount] = useState('0.1');
  const [proposalId, setProposalId] = useState('0');
  const [status, setStatus] = useState('');
  const toast = useToast();

  async function registerDonor() {
    const toastId = toast.info('Registering as Donor', 'Sending registration transaction...');
    try {
      setStatus('Registering...');
      const tx = await contracts.voting.registerAsDonor();
      await tx.wait();
      setStatus('Registered as donor successfully!');
      toast.dismiss(toastId);
      toast.success('Donor Registration', 'Successfully registered as a voter/donor!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Registration Failed', err.message);
    }
  }

  async function donate() {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.warning('Input Required', 'Please enter a donation amount greater than 0.');
      return;
    }
    const toastId = toast.info('Sending Donation', `Processing donation of ${ethAmount} ETH...`);
    try {
      setStatus('Donating...');
      const tx = await contracts.donation.donate({ value: ethers.parseEther(ethAmount || '0') });
      await tx.wait();
      setStatus('Donation sent successfully!');
      toast.dismiss(toastId);
      toast.success('Donation Received', `Successfully contributed ${ethAmount} ETH to Samaritan Escrow.`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Donation Failed', err.message);
    }
  }

  async function vote(support) {
    if (proposalId === '') {
      toast.warning('Input Required', 'Please enter a Proposal ID to vote on.');
      return;
    }
    const voteChoice = support ? 'FOR' : 'AGAINST';
    const toastId = toast.info('Casting Vote', `Submitting vote ${voteChoice} on Proposal #${proposalId}...`);
    try {
      setStatus(`Voting ${support ? 'FOR' : 'AGAINST'}...`);
      const tx = await contracts.voting.vote(proposalId, support);
      await tx.wait();
      setStatus('Vote cast successfully!');
      toast.dismiss(toastId);
      toast.success('Vote Cast', `Successfully voted ${voteChoice} on Proposal #${proposalId}.`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Voting Failed', err.message);
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
