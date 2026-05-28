import { useState } from 'react';
import { useToast } from './Toast';

export default function AnalystPanel({ contracts }) {
  const [name, setName] = useState('UNICEF');
  const [wallet, setWallet] = useState('');
  const [percentage, setPercentage] = useState('20');
  const [charityId, setCharityId] = useState('0');
  const [newPercentage, setNewPercentage] = useState('25');
  const [status, setStatus] = useState('');
  const toast = useToast();

  async function proposeAdd() {
    if (!name || !wallet || !percentage) {
      toast.warning('Input Required', 'Please fill all charity proposal fields.');
      return;
    }
    const toastId = toast.info('Submitting Proposal', `Creating proposal to add ${name}...`);
    try {
      setStatus('Submitting Add Proposal...');
      const tx = await contracts.voting.proposeAddCharity(name, wallet, percentage);
      await tx.wait();
      setStatus('Add proposal submitted successfully!');
      toast.dismiss(toastId);
      toast.success('Proposal Created', `Charity proposal for "${name}" submitted successfully.`);
      setWallet('');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Submission Failed', err.message);
    }
  }

  async function proposeUpdate() {
    if (!charityId || !newPercentage) {
      toast.warning('Input Required', 'Please enter Charity ID and the new percentage.');
      return;
    }
    const toastId = toast.info('Submitting Proposal', `Creating proposal to update charity #${charityId} percentage to ${newPercentage}%...`);
    try {
      setStatus('Submitting Update Proposal...');
      const tx = await contracts.voting.proposeUpdatePercentage(charityId, newPercentage);
      await tx.wait();
      setStatus('Update proposal submitted successfully!');
      toast.dismiss(toastId);
      toast.success('Proposal Created', `Percentage update proposal for Charity #${charityId} submitted successfully.`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Submission Failed', err.message);
    }
  }

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>Analyst Panel</h2>
        <p>Propose adding new charities or updating allocations.</p>
      </div>

      {status && <p className="ok" style={{ marginBottom: '16px' }}>{status}</p>}

      <div style={{ marginBottom: '24px' }}>
        <h4>Propose New Charity</h4>
        <label className="field">
          <span>Charity Name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>Charity Wallet</span>
          <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)} />
        </label>
        <label className="field">
          <span>Percentage</span>
          <input type="text" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
        </label>
        <button onClick={proposeAdd} style={{ marginTop: '8px' }}>Submit Add Proposal</button>
      </div>

      <hr />

      <div>
        <h4>Propose Percentage Update</h4>
        <label className="field">
          <span>Charity ID</span>
          <input type="text" value={charityId} onChange={(e) => setCharityId(e.target.value)} />
        </label>
        <label className="field">
          <span>New Percentage</span>
          <input type="text" value={newPercentage} onChange={(e) => setNewPercentage(e.target.value)} />
        </label>
        <button onClick={proposeUpdate} style={{ marginTop: '8px' }}>Submit Update Proposal</button>
      </div>
    </section>
  );
}
