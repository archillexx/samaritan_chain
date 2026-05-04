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
    <section className="card">
      <div className="cardHeader">
        <h2>Charity Proof Submission</h2>
        <p>Submit evidence of your charitable work to release funds.</p>
      </div>

      {status && <p className="ok" style={{ marginBottom: '16px' }}>{status}</p>}

      <label className="field">
        <span>Charity ID</span>
        <input type="text" value={charityId} onChange={(e) => setCharityId(e.target.value)} />
      </label>
      
      <label className="field">
        <span>Evidence URI (e.g., IPFS hash)</span>
        <input type="text" value={evidenceURI} onChange={(e) => setEvidenceURI(e.target.value)} />
      </label>
      
      <button onClick={submitProof} style={{ marginTop: '8px' }}>Submit Proof</button>
    </section>
  );
}
