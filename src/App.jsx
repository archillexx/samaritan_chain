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
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Samaritan Chain dApp</h1>
      <p>{status}</p>
      
      {!account ? (
        <button onClick={connectWallet} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Connect Wallet
        </button>
      ) : (
        <div>
          {!contracts ? (
            <SetupPanel onReady={handleContractsReady} />
          ) : (
            <div>
              <DashboardPanel contracts={contracts} account={account} />
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <DonorPanel contracts={contracts} account={account} />
                  <CharityPanel contracts={contracts} />
                  <VotingPanel contracts={contracts} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <AnalystPanel contracts={contracts} />
                  <AdminPanel contracts={contracts} />
                  <LookupPanel contracts={contracts} />
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
