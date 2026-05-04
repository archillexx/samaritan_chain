import { useState, useMemo } from 'react';
import { CONTRACTS, getSavedAddresses, saveAddresses } from '../contracts/contractConfig';
import { ethers } from 'ethers';

export default function SetupPanel({ onReady }) {
  const [addresses, setAddresses] = useState(getSavedAddresses());

  const addressesReady = useMemo(
    () => Object.values(addresses).every((address) => ethers.isAddress(address)),
    [addresses]
  );

  function updateAddress(key, value) {
    const next = { ...addresses, [key]: value.trim() };
    setAddresses(next);
    saveAddresses(next);
  }

  return (
    <div style={{ border: '1px solid black', padding: '20px', marginBottom: '20px' }}>
      <h2>Setup: Contract Addresses</h2>
      <p>Paste your deployed contract addresses here.</p>
      
      {Object.entries(CONTRACTS).map(([key, config]) => (
        <div key={key} style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>{config.label}</label>
          <input
            type="text"
            value={addresses[key] || ''}
            onChange={(e) => updateAddress(key, e.target.value)}
            style={{ width: '300px' }}
          />
        </div>
      ))}
      
      <p>{addressesReady ? 'Addresses valid.' : 'Please enter valid Ethereum addresses.'}</p>
      
      <button 
        disabled={!addressesReady} 
        onClick={() => onReady(addresses)}
      >
        Load Contracts
      </button>
    </div>
  );
}
