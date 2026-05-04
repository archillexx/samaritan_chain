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
    <section className="card">
      <div className="cardHeader">
        <h2>Admin Operations</h2>
        <p>Wire contracts and manage access control.</p>
      </div>

      {status && <p className="ok" style={{ marginBottom: '16px' }}>{status}</p>}

      <div style={{ marginBottom: '24px' }}>
        <button onClick={wireContracts}>Wire Contracts Together</button>
      </div>

      <hr />

      <div style={{ marginBottom: '24px' }}>
        <h4>Access Control</h4>
        <label className="field">
          <span>Analyst Wallet Address</span>
          <input type="text" value={analyst} onChange={(e) => setAnalyst(e.target.value)} />
        </label>
        <button className="secondary" onClick={registerAnalyst}>Register Analyst</button>
        
        <div style={{ margin: '16px 0' }}></div>
        
        <label className="field">
          <span>Charity Wallet Address</span>
          <input type="text" value={charityWallet} onChange={(e) => setCharityWallet(e.target.value)} />
        </label>
        <button className="secondary" onClick={registerCharity}>Register Charity Wallet</button>
      </div>

      <hr />

      <div>
        <h4>Validate Proof Submissions</h4>
        <label className="field">
          <span>Submission ID</span>
          <input type="text" value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} />
        </label>
        <div className="row" style={{ marginTop: '8px' }}>
          <button onClick={() => validate(true)}>Accept & Release Funds</button>
          <button className="secondary" onClick={() => validate(false)}>Reject Proof</button>
        </div>
      </div>
    </section>
  );
}
