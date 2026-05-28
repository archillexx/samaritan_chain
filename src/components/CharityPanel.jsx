import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from './Toast';

export default function CharityPanel({ contracts, account }) {
  const [charityId, setCharityId] = useState('0');
  const [evidenceURI, setEvidenceURI] = useState('ipfs://QmExample');
  const [status, setStatus] = useState('');
  const [charityProfile, setCharityProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function checkRegisteredCharity() {
      if (!contracts || !account) return;
      setProfileLoading(true);
      try {
        const count = await contracts.allocation.charityCount();
        let found = null;
        for (let i = 0n; i < count; i++) {
          const res = await contracts.allocation.getCharity(i);
          if (res[1] && res[1].toLowerCase() === account.toLowerCase()) {
            found = {
              id: i.toString(),
              name: res[0],
              wallet: res[1],
              percentage: res[2],
              active: res[3]
            };
            break;
          }
        }

        if (found) {
          // Fetch escrow balance and live wallet balance from provider
          const provider = contracts.donation.runner.provider || contracts.donation.runner;
          const [escrowBalanceWei, walletBalanceWei] = await Promise.all([
            contracts.donation.getBalance(),
            provider.getBalance(found.wallet)
          ]);
          const allocatedWei = (escrowBalanceWei * found.percentage) / 100n;

          setCharityProfile({
            id: found.id,
            name: found.name,
            wallet: found.wallet,
            percentage: found.percentage.toString(),
            active: found.active,
            walletBalance: ethers.formatEther(walletBalanceWei),
            allocatedBalance: ethers.formatEther(allocatedWei)
          });
          setCharityId(found.id);
        } else {
          setCharityProfile(null);
        }
      } catch (err) {
        console.error("Error auto-detecting charity status:", err);
      } finally {
        setProfileLoading(false);
      }
    }

    checkRegisteredCharity();
  }, [contracts, account]);

  async function submitProof() {
    if (!charityId || !evidenceURI) {
      toast.warning('Input Required', 'Please enter Charity ID and Evidence URI.');
      return;
    }
    const toastId = toast.info('Submitting Proof', `Uploading proof of delivery for Charity #${charityId}...`);
    try {
      setStatus('Submitting proof...');
      const tx = await contracts.delivery.submitProof(charityId, evidenceURI);
      await tx.wait();
      setStatus('Proof submitted successfully!');
      toast.dismiss(toastId);
      toast.success('Proof Submitted', `Evidence URI successfully uploaded for Charity #${charityId}.`);
      
      // Refresh balances if charityProfile is loaded and matches the submitted charityId
      if (charityProfile && charityProfile.id === charityId) {
        const provider = contracts.donation.runner.provider || contracts.donation.runner;
        const [escrowBalanceWei, walletBalanceWei] = await Promise.all([
          contracts.donation.getBalance(),
          provider.getBalance(charityProfile.wallet)
        ]);
        const allocatedWei = (escrowBalanceWei * BigInt(charityProfile.percentage)) / 100n;
        setCharityProfile(prev => ({
          ...prev,
          walletBalance: ethers.formatEther(walletBalanceWei),
          allocatedBalance: ethers.formatEther(allocatedWei)
        }));
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      toast.dismiss(toastId);
      toast.error('Submission Failed', err.message);
    }
  }

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>Charity Proof Submission</h2>
        <p>Submit evidence of your charitable work to release funds.</p>
      </div>

      {status && <p className="ok" style={{ marginBottom: '16px' }}>{status}</p>}

      {profileLoading && (
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <div className="indicatorDot" style={{ background: 'var(--primary)', animation: 'pulse 1.5s infinite' }}></div>
          <span style={{ fontSize: '13px', color: 'var(--secondary-text)', fontWeight: '600' }}>Checking charity registration...</span>
        </div>
      )}

      {!profileLoading && charityProfile && (
        <div className="resultBox" style={{ marginTop: '0', marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderColor: '#bbf7d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
              {charityProfile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#166534' }}>{charityProfile.name}</h3>
                <span className="badge success" style={{ fontSize: '10px', padding: '2px 6px' }}>✓ Registered</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#15803d', fontFamily: 'monospace' }} className="truncate">
                {charityProfile.wallet}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', borderTop: '1px solid #bbf7d0', paddingTop: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(22, 101, 52, 0.1)' }}>
              <span style={{ display: 'block', fontSize: '9px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Allocation Share</span>
              <strong style={{ display: 'block', fontSize: '15px', color: '#166534', marginTop: '4px' }}>{charityProfile.percentage}%</strong>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(22, 101, 52, 0.1)' }}>
              <span style={{ display: 'block', fontSize: '9px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Escrow Share</span>
              <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }} title="Your estimated allocation remaining in Escrow pool">{charityProfile.allocatedBalance} ETH</strong>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(22, 101, 52, 0.1)' }}>
              <span style={{ display: 'block', fontSize: '9px', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Released Balance</span>
              <strong style={{ display: 'block', fontSize: '15px', color: '#15803d', marginTop: '4px' }} title="On-chain balance of your charity wallet">{charityProfile.walletBalance} ETH</strong>
            </div>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#15803d', fontStyle: 'italic', textAlign: 'center' }}>
            Your Charity ID <strong>#{charityProfile.id}</strong> has been auto-detected and filled below.
          </p>
        </div>
      )}

      {!profileLoading && !charityProfile && account && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <span style={{ fontSize: '16px' }}>ℹ️</span>
          <p style={{ margin: 0, fontSize: '12px', color: '#b45309', lineHeight: '1.4' }}>
            Connected wallet is not recognized as a registered charity. You can still submit proof by manually typing in the correct Charity ID.
          </p>
        </div>
      )}

      <label className="field">
        <span>Charity ID</span>
        <input 
          type="text" 
          value={charityId} 
          onChange={(e) => setCharityId(e.target.value)} 
          disabled={!!charityProfile} 
          style={charityProfile ? { background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : {}}
        />
      </label>
      
      <label className="field">
        <span>Evidence URI (e.g., IPFS hash)</span>
        <input type="text" value={evidenceURI} onChange={(e) => setEvidenceURI(e.target.value)} />
      </label>
      
      <button onClick={submitProof} style={{ marginTop: '8px' }}>Submit Proof</button>
    </section>
  );
}
