import { useState } from 'react';
import { useToast } from './Toast';

export default function VotingPanel({ contracts }) {
  const [proposalId, setProposalId] = useState('0');
  const [proposal, setProposal] = useState(null);
  const [status, setStatus] = useState('');
  const toast = useToast();

  async function loadProposal() {
    if (proposalId === '') {
      toast.warning('Input Required', 'Please enter a Proposal ID.');
      return;
    }
    const toastId = toast.info('Loading Proposal', `Fetching Proposal #${proposalId} from smart contract...`, 3000);
    try {
      setStatus('Loading proposal...');
      const basic = await contracts.voting.getProposal(proposalId);
      const full = await contracts.voting.proposals(proposalId);
      setProposal({
        name: basic[0] || '(percentage update)',
        votesFor: basic[1].toString(),
        votesAgainst: basic[2].toString(),
        deadline: new Date(Number(basic[3]) * 1000).toLocaleString(),
        executed: basic[4],
        isOpen: basic[5],
        type: Number(full[0]) === 0 ? 'Add charity' : 'Update percentage',
        wallet: full[2],
        charityId: full[3].toString(),
        percentage: full[4].toString()
      });
      setStatus('');
      toast.dismiss(toastId);
      toast.success('Proposal Loaded', `Successfully retrieved details for Proposal #${proposalId}.`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      setProposal(null);
      toast.dismiss(toastId);
      toast.error('Load Failed', err.message);
    }
  }

  async function execute() {
    if (proposalId === '') {
      toast.warning('Input Required', 'Please enter a Proposal ID.');
      return;
    }
    const toastId = toast.info('Executing Proposal', `Submitting execution request for Proposal #${proposalId}...`);
    try {
      setStatus('Executing proposal...');
      const tx = await contracts.voting.executeProposal(proposalId);
      await tx.wait();
      setStatus('Proposal executed successfully!');
      toast.dismiss(toastId);
      toast.success('Proposal Executed', `Proposal #${proposalId} executed successfully and allocation synced.`);
      loadProposal();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Execution Failed', err.message);
    }
  }

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>Proposal Execution</h2>
        <p>View and execute closed proposals.</p>
      </div>

      {status && <p className="warn" style={{ marginBottom: '16px' }}>{status}</p>}

      <label className="field">
        <span>Proposal ID</span>
        <input type="text" value={proposalId} onChange={(e) => setProposalId(e.target.value)} />
      </label>
      <div className="row" style={{ marginTop: '8px', marginBottom: '16px' }}>
        <button className="secondary" onClick={loadProposal}>Load Proposal</button>
        <button onClick={execute}>Execute Proposal</button>
      </div>

      {proposal && (
        <div className="resultBox">
          <div className="resultHeader">
            <span className="badge">{proposal.type}</span>
            <span className={`badge ${proposal.executed ? 'neutral' : proposal.isOpen ? 'success' : 'warning'}`}>
              {proposal.executed ? 'Executed' : proposal.isOpen ? 'Open' : 'Ready to execute'}
            </span>
          </div>
          <div className="resultGrid">
            <div><label>Name</label><p>{proposal.name}</p></div>
            <div><label>Charity ID</label><p>{proposal.charityId}</p></div>
            <div><label>Wallet</label><p className="truncate">{proposal.wallet}</p></div>
            <div><label>Percentage</label><p>{proposal.percentage}%</p></div>
            <div><label>Votes For</label><p className="ok">{proposal.votesFor}</p></div>
            <div><label>Votes Against</label><p className="warn">{proposal.votesAgainst}</p></div>
          </div>
          <div className="resultFooter">
            <p><strong>Deadline:</strong> {proposal.deadline}</p>
          </div>
        </div>
      )}
    </section>
  );
}
