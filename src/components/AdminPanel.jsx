import { useState } from 'react';
import { getSavedAddresses } from '../contracts/contractConfig';
import { useToast } from './Toast';

export default function AdminPanel({ contracts }) {
  const [analyst, setAnalyst] = useState('');
  const [charityWallet, setCharityWallet] = useState('');
  const [submissionId, setSubmissionId] = useState('0');
  const [status, setStatus] = useState('');
  const toast = useToast();

  async function wireContracts() {
    const toastId = toast.info('Wiring Contracts', 'Initiating contract coupling transaction...');
    try {
      setStatus('Wiring contracts...');
      const addresses = getSavedAddresses();
      
      let tx = await contracts.donation.setAllocationContract(addresses.allocation);
      toast.info('Wiring Contracts', 'Setting Allocation contract in Donation escrow...', 8000);
      await tx.wait();
      
      tx = await contracts.allocation.setVotingContract(addresses.voting);
      toast.info('Wiring Contracts', 'Setting Voting contract in Allocation...', 8000);
      await tx.wait();
      
      tx = await contracts.allocation.setDeliveryContract(addresses.delivery);
      toast.info('Wiring Contracts', 'Setting Delivery contract in Allocation...', 8000);
      await tx.wait();
      
      setStatus('Contracts wired successfully!');
      toast.dismiss(toastId);
      toast.success('Contracts Coupled', 'All contracts have been successfully wired together!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Wiring Failed', err.message);
    }
  }

  async function registerAnalyst() {
    if (!analyst) {
      toast.warning('Input Required', 'Please enter an Analyst wallet address.');
      return;
    }
    const toastId = toast.info('Registering Analyst', 'Sending registration transaction...');
    try {
      setStatus('Registering analyst...');
      const tx = await contracts.voting.registerAnalyst(analyst);
      await tx.wait();
      setStatus('Analyst registered!');
      toast.dismiss(toastId);
      toast.success('Analyst Registered', `Address ${analyst.slice(0,6)}...${analyst.slice(-4)} authorized as Analyst.`);
      setAnalyst('');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Registration Failed', err.message);
    }
  }

  async function registerCharity() {
    if (!charityWallet) {
      toast.warning('Input Required', 'Please enter a Charity wallet address.');
      return;
    }
    const toastId = toast.info('Registering Charity', 'Sending registration transaction...');
    try {
      setStatus('Registering charity wallet...');
      const tx = await contracts.delivery.registerCharity(charityWallet);
      await tx.wait();
      setStatus('Charity registered!');
      toast.dismiss(toastId);
      toast.success('Charity Registered', `Wallet ${charityWallet.slice(0,6)}...${charityWallet.slice(-4)} registered.`);
      setCharityWallet('');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Registration Failed', err.message);
    }
  }

  async function validate(accepted) {
    const actionLabel = accepted ? 'Accept & Release Funds' : 'Reject Proof';
    const toastId = toast.info(actionLabel, `Processing proof submission #${submissionId}...`);
    try {
      setStatus(`Validating proof as ${accepted ? 'Accepted' : 'Rejected'}...`);
      const tx = await contracts.delivery.validateProof(submissionId, accepted);
      await tx.wait();
      const statusText = `Proof ${accepted ? 'approved & funds released' : 'rejected'}.`;
      setStatus(statusText);
      toast.dismiss(toastId);
      toast.success('Proof Evaluated', `Submission #${submissionId} has been ${accepted ? 'Approved (Funds Released)' : 'Rejected'}.`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Evaluation Failed', err.message);
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
