import { useState } from 'react';

export default function VotingPanel({ contracts }) {
  const [proposalId, setProposalId] = useState('0');
  const [proposal, setProposal] = useState(null);
  const [status, setStatus] = useState('');

  async function loadProposal() {
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
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      setProposal(null);
    }
  }

  async function execute() {
    try {
      setStatus('Executing proposal...');
      const tx = await contracts.voting.executeProposal(proposalId);
      await tx.wait();
      setStatus('Proposal executed successfully!');
      loadProposal();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
      <h2>Proposal Lookup & Execution</h2>
      <p style={{ color: 'blue' }}>{status}</p>

      <div style={{ marginBottom: '10px' }}>
        <label>Proposal ID: </label>
        <input type="text" value={proposalId} onChange={(e) => setProposalId(e.target.value)} />
        <button onClick={loadProposal}>Load Proposal</button>
        <button onClick={execute}>Execute Proposal</button>
      </div>

      {proposal && (
        <div style={{ background: '#eee', padding: '10px' }}>
          <p><strong>Type:</strong> {proposal.type}</p>
          <p><strong>Name:</strong> {proposal.name}</p>
          <p><strong>Charity ID:</strong> {proposal.charityId}</p>
          <p><strong>Percentage:</strong> {proposal.percentage}%</p>
          <p><strong>Votes:</strong> {proposal.votesFor} For / {proposal.votesAgainst} Against</p>
          <p><strong>Status:</strong> {proposal.executed ? 'Executed' : proposal.isOpen ? 'Open' : 'Ready to execute'}</p>
          <p><strong>Deadline:</strong> {proposal.deadline}</p>
        </div>
      )}
    </div>
  );
}
