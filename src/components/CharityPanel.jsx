import { useState } from 'react';

export default function CharityPanel({ contracts }) {
  const [charityId, setCharityId] = useState('0');
  const [evidenceURI, setEvidenceURI] = useState('ipfs://QmExample');
  const [status, setStatus] = useState('');

  async function submitProof() {
    try {
      setStatus('Submitting proof...');
      const tx = await contracts.delivery.submitProof(charityId, evidenceURI);
      await tx.wait();
      setStatus('Proof submitted successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
      <h2>Charity Panel</h2>
      <p style={{ color: 'blue' }}>{status}</p>

      <div style={{ marginBottom: '10px' }}>
        <label>Charity ID: </label>
        <input type="text" value={charityId} onChange={(e) => setCharityId(e.target.value)} />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>Evidence URI: </label>
        <input type="text" value={evidenceURI} onChange={(e) => setEvidenceURI(e.target.value)} />
      </div>
      <button onClick={submitProof}>Submit Proof</button>
    </div>
  );
}
