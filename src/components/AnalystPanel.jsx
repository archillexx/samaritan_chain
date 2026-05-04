import { useState } from 'react';

export default function AnalystPanel({ contracts }) {
  const [name, setName] = useState('UNICEF');
  const [wallet, setWallet] = useState('');
  const [percentage, setPercentage] = useState('20');
  const [charityId, setCharityId] = useState('0');
  const [newPercentage, setNewPercentage] = useState('25');
  const [status, setStatus] = useState('');

  async function proposeAdd() {
    try {
      setStatus('Submitting Add Proposal...');
      const tx = await contracts.voting.proposeAddCharity(name, wallet, percentage);
      await tx.wait();
      setStatus('Add proposal submitted successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function proposeUpdate() {
    try {
      setStatus('Submitting Update Proposal...');
      const tx = await contracts.voting.proposeUpdatePercentage(charityId, newPercentage);
      await tx.wait();
      setStatus('Update proposal submitted successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
      <h2>Analyst Panel</h2>
      <p style={{ color: 'blue' }}>{status}</p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Propose New Charity</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Charity Name: </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Charity Wallet: </label>
          <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Percentage: </label>
          <input type="text" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
        </div>
        <button onClick={proposeAdd}>Submit Add Proposal</button>
      </div>

      <div>
        <h3>Propose Percentage Update</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Charity ID: </label>
          <input type="text" value={charityId} onChange={(e) => setCharityId(e.target.value)} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>New Percentage: </label>
          <input type="text" value={newPercentage} onChange={(e) => setNewPercentage(e.target.value)} />
        </div>
        <button onClick={proposeUpdate}>Submit Update Proposal</button>
      </div>
    </div>
  );
}
