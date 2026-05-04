import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from './contracts/contractConfig';
import SetupPanel from './components/SetupPanel';
import DashboardPanel from './components/DashboardPanel';
import DonorPanel from './components/DonorPanel';
import AnalystPanel from './components/AnalystPanel';
import CharityPanel from './components/CharityPanel';
import AdminPanel from './components/AdminPanel';
import VotingPanel from './components/VotingPanel';
import LookupPanel from './components/LookupPanel';

export default function App() {
  const [account, setAccount] = useState('');
  const [signer, setSigner] = useState(null);
  const [status, setStatus] = useState('Welcome to Samaritan Chain. Please connect your wallet.');
  const [contracts, setContracts] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus('MetaMask is not installed. Please install it.');
      return;
    }

    try {
      setStatus('Requesting wallet connection...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const userSigner = await provider.getSigner();
      const userAddress = await userSigner.getAddress();
      
      setSigner(userSigner);
      setAccount(userAddress);
      setStatus(`Wallet connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  }

  function handleContractsReady(addresses) {
    const loadedContracts = Object.fromEntries(
      Object.entries(CONTRACTS).map(([key, config]) => [
        key,
        new ethers.Contract(addresses[key], config.abi, signer),
      ])
    );
    setContracts(loadedContracts);
    setStatus('Contracts loaded successfully.');
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">IFB452 Group Project</p>
          <h1>Samaritan Chain</h1>
          <p className="subtitle">Transparent, decentralized charity fund allocation and delivery system.</p>
        </div>
        <div className="walletBox">
          <button onClick={connectWallet}>
            {account ? 'Reconnect Wallet' : 'Connect Wallet'}
          </button>
          {account && <p className="walletInfo">{account.slice(0,6)}...{account.slice(-4)}</p>}
        </div>
      </header>

      <div style={{ marginBottom: '24px', padding: '16px', background: '#e2e8f0', borderRadius: '12px' }}>
        <strong>Status: </strong> {status}
      </div>
      
      {account && (
        <div className="tabContent">
          {!contracts ? (
            <SetupPanel onReady={handleContractsReady} />
          ) : (
            <div>
              <DashboardPanel contracts={contracts} account={account} />
              
              <div className="grid two">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <DonorPanel contracts={contracts} account={account} />
                  <CharityPanel contracts={contracts} />
                  <VotingPanel contracts={contracts} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <AnalystPanel contracts={contracts} />
                  <AdminPanel contracts={contracts} />
                  <LookupPanel contracts={contracts} />
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </main>
  );
}
