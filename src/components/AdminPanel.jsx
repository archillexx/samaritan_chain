import { useState } from 'react';
import { getSavedAddresses } from '../contracts/contractConfig';

export default function AdminPanel({ contracts }) {
  const [analyst, setAnalyst] = useState('');
  const [charityWallet, setCharityWallet] = useState('');
  const [submissionId, setSubmissionId] = useState('0');
  const [status, setStatus] = useState('');

  async function wireContracts() {
    try {
      setStatus('Wiring contracts...');
      const addresses = getSavedAddresses();
      let tx = await contracts.donation.setAllocationContract(addresses.allocation);
      await tx.wait();
      tx = await contracts.allocation.setVotingContract(addresses.voting);
      await tx.wait();
      tx = await contracts.allocation.setDeliveryContract(addresses.delivery);
      await tx.wait();
      setStatus('Contracts wired successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function registerAnalyst() {
    try {
      setStatus('Registering analyst...');
      const tx = await contracts.voting.registerAnalyst(analyst);
      await tx.wait();
      setStatus('Analyst registered!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function registerCharity() {
    try {
      setStatus('Registering charity wallet...');
      const tx = await contracts.delivery.registerCharity(charityWallet);
      await tx.wait();
      setStatus('Charity registered!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function validate(accepted) {
    try {
      setStatus(`Validating proof as ${accepted ? 'Accepted' : 'Rejected'}...`);
      const tx = await contracts.delivery.validateProof(submissionId, accepted);
      await tx.wait();
      setStatus(`Proof ${accepted ? 'approved & funds released' : 'rejected'}.`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
      <h2>Admin Panel</h2>
      <p style={{ color: 'blue' }}>{status}</p>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={wireContracts}>Wire Contracts Together</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Access Control</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Analyst Wallet: </label>
          <input type="text" value={analyst} onChange={(e) => setAnalyst(e.target.value)} />
          <button onClick={registerAnalyst}>Register Analyst</button>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Charity Wallet: </label>
          <input type="text" value={charityWallet} onChange={(e) => setCharityWallet(e.target.value)} />
          <button onClick={registerCharity}>Register Charity</button>
        </div>
      </div>

      <div>
        <h3>Validate Proof Submissions</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Submission ID: </label>
          <input type="text" value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} />
        </div>
        <button onClick={() => validate(true)}>Accept & Release Funds</button>
        <button onClick={() => validate(false)}>Reject Proof</button>
      </div>
    </div>
  );
}
