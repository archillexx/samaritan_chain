import { useState } from 'react';
import { ethers } from 'ethers';
import { useToast } from './Toast';

export default function LookupPanel({ contracts }) {
  const [charityId, setCharityId] = useState('0');
  const [submissionId, setSubmissionId] = useState('0');
  const [charity, setCharity] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [status, setStatus] = useState('');
  const toast = useToast();

  async function loadCharity() {
    if (charityId === '') {
      toast.warning('Input Required', 'Please enter a Charity ID.');
      return;
    }
    const toastId = toast.info('Querying Blockchain', `Retrieving charity #${charityId} details...`, 3000);
    try {
      const result = await contracts.allocation.getCharity(charityId);
      const name = result[0];
      const wallet = result[1];
      const percentage = result[2];
      const active = result[3];

      // Fetch escrow balance and live wallet balance from provider
      const provider = contracts.donation.runner.provider || contracts.donation.runner;
      const [escrowBalanceWei, walletBalanceWei] = await Promise.all([
        contracts.donation.getBalance(),
        provider.getBalance(wallet)
      ]);

      const allocatedWei = (escrowBalanceWei * percentage) / 100n;

      setCharity({ 
        name, 
        wallet, 
        percentage: percentage.toString(), 
        active,
        walletBalance: ethers.formatEther(walletBalanceWei),
        allocatedBalance: ethers.formatEther(allocatedWei)
      });
      setStatus('');
      toast.dismiss(toastId);
      toast.success('Charity Data Retrieved', `Loaded details for ${name || 'Charity #' + charityId}.`);
    } catch (err) {
      setStatus(`Error loading charity: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Lookup Failed', err.message);
    }
  }

  async function loadSubmission() {
    if (submissionId === '') {
      toast.warning('Input Required', 'Please enter a Submission ID.');
      return;
    }
    const toastId = toast.info('Querying Blockchain', `Retrieving proof submission #${submissionId}...`, 3000);
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
      toast.dismiss(toastId);
      toast.success('Proof Details Loaded', `Retrieved details for submission #${submissionId}.`);
    } catch (err) {
      setStatus(`Error loading submission: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Lookup Failed', err.message);
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
          <div className="resultBox" style={{ marginTop: '16px' }}>
            <div className="resultHeader" style={{ marginBottom: '12px', paddingBottom: '8px' }}>
              <span className={`badge ${charity.active ? 'success' : 'warning'}`}>
                {charity.active ? 'Active Charity' : 'Inactive Charity'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--secondary-text)' }}>
                ID: {charityId}
              </span>
            </div>
            
            <div className="resultGrid" style={{ gridTemplateColumns: '1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '600' }}>Charity Name</label>
                <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{charity.name}</p>
              </div>
              <div>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '600' }}>Wallet Address</label>
                <p className="truncate" style={{ margin: '2px 0 0', fontSize: '13px', fontFamily: 'monospace', color: '#334155' }}>{charity.wallet}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Allocation</span>
                <strong style={{ display: 'block', fontSize: '16px', color: 'var(--primary)', marginTop: '4px' }}>{charity.percentage}%</strong>
              </div>
              
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Escrow Share</span>
                <strong style={{ display: 'block', fontSize: '16px', color: 'var(--primary)', marginTop: '4px' }} title="Calculated allocation from Escrow Pool">{charity.allocatedBalance} ETH</strong>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Wallet Balance</span>
                <strong style={{ display: 'block', fontSize: '16px', color: 'var(--success)', marginTop: '4px' }} title="On-chain balance released to charity">{charity.walletBalance} ETH</strong>
              </div>
            </div>
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
