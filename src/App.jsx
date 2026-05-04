import { useState } from 'react';
import { ethers } from 'ethers';

export default function App() {
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState('Welcome to Samaritan Chain. Please connect your wallet.');

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus('MetaMask is not installed. Please install it.');
      return;
    }

    try {
      setStatus('Requesting wallet connection...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      setAccount(userAddress);
      setStatus(`Wallet connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
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
          <h2>Dashboard</h2>
          <p>More features coming soon...</p>
        </div>
      )}
    </div>
  );
}
