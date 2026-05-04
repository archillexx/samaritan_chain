import { useState } from 'react';

export default function LookupPanel({ contracts }) {
  const [charityId, setCharityId] = useState('0');
  const [submissionId, setSubmissionId] = useState('0');
  const [charity, setCharity] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [status, setStatus] = useState('');

  async function loadCharity() {
    try {
      const result = await contracts.allocation.getCharity(charityId);
      setCharity({ 
        name: result[0], 
        wallet: result[1], 
        percentage: result[2].toString(), 
        active: result[3] 
      });
      setStatus('');
    } catch (err) {
      setStatus(`Error loading charity: ${err.message}`);
    }
  }

  async function loadSubmission() {
    try {
      const result = await contracts.delivery.getSubmission(submissionId);
      setSubmission({ 
        charityId: result[0].toString(), 
        submittedBy: result[1], 
        evidenceURI: result[2], 
        validated: result[3], 
        rejected: result[4] 
      });
      setStatus('');
    } catch (err) {
      setStatus(`Error loading submission: ${err.message}`);
    }
  }

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>Data Lookup</h2>
        <p>Read-only verification tools.</p>
      </div>

      {status && <p className="warn" style={{ marginBottom: '16px' }}>{status}</p>}

      <div style={{ marginBottom: '24px' }}>
        <h4>Lookup Charity</h4>
        <label className="field">
          <span>Charity ID</span>
          <input type="text" value={charityId} onChange={(e) => setCharityId(e.target.value)} />
        </label>
        <button className="secondary" onClick={loadCharity} style={{ marginTop: '8px' }}>Load Charity</button>
        
        {charity && (
          <div className="resultBox small">
            <p><strong>Name:</strong> {charity.name}</p>
            <p className="truncate"><strong>Wallet:</strong> {charity.wallet}</p>
            <p><strong>Allocation:</strong> {charity.percentage}%</p>
            <p><strong>Status:</strong> <span className={charity.active ? 'ok' : 'warn'}>{charity.active ? 'Active' : 'Inactive'}</span></p>
          </div>
        )}
      </div>

      <hr />

      <div>
        <h4>Lookup Proof Submission</h4>
        <label className="field">
          <span>Submission ID</span>
          <input type="text" value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} />
        </label>
        <button className="secondary" onClick={loadSubmission} style={{ marginTop: '8px' }}>Load Submission</button>
        
        {submission && (
          <div className="resultBox small">
            <p><strong>Charity ID:</strong> {submission.charityId}</p>
            <p className="truncate"><strong>Submitted By:</strong> {submission.submittedBy}</p>
            <p className="truncate"><strong>Evidence URI:</strong> {submission.evidenceURI}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={submission.validated ? 'ok' : submission.rejected ? 'warn' : 'neutral'}>
                {submission.validated ? 'Validated & Paid' : submission.rejected ? 'Rejected' : 'Pending Review'}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
