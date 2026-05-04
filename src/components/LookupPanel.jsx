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
    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
      <h2>Data Lookup</h2>
      <p style={{ color: 'red' }}>{status}</p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Lookup Charity</h3>
        <label>Charity ID: </label>
        <input type="text" value={charityId} onChange={(e) => setCharityId(e.target.value)} />
        <button onClick={loadCharity}>Load</button>
        {charity && (
          <ul>
            <li>Name: {charity.name}</li>
            <li>Wallet: {charity.wallet}</li>
            <li>Allocation: {charity.percentage}%</li>
            <li>Active: {charity.active ? 'Yes' : 'No'}</li>
          </ul>
        )}
      </div>

      <div>
        <h3>Lookup Proof Submission</h3>
        <label>Submission ID: </label>
        <input type="text" value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} />
        <button onClick={loadSubmission}>Load</button>
        {submission && (
          <ul>
            <li>Charity ID: {submission.charityId}</li>
            <li>Submitted By: {submission.submittedBy}</li>
            <li>Evidence: {submission.evidenceURI}</li>
            <li>Status: {submission.validated ? 'Validated' : submission.rejected ? 'Rejected' : 'Pending'}</li>
          </ul>
        )}
      </div>
    </div>
  );
}
