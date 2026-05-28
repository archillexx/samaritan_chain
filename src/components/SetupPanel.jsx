import { useState, useMemo } from 'react';
import { CONTRACTS, getSavedAddresses, saveAddresses } from '../contracts/contractConfig';
import { ethers } from 'ethers';
import { useToast } from './Toast';

export default function SetupPanel({ onReady }) {
  const [addresses, setAddresses] = useState(getSavedAddresses());
  const toast = useToast();

  const addressesReady = useMemo(
    () => Object.values(addresses).every((address) => ethers.isAddress(address)),
    [addresses]
  );

  function updateAddress(key, value) {
    const trimmed = value.trim();
    const next = { ...addresses, [key]: trimmed };
    setAddresses(next);
    saveAddresses(next);

    if (trimmed !== '' && !ethers.isAddress(trimmed)) {
      toast.warning('Invalid Address Format', `The address for ${CONTRACTS[key].label} is not a valid Ethereum address.`);
    } else if (ethers.isAddress(trimmed)) {
      toast.success('Address Saved', `${CONTRACTS[key].label} address configured successfully.`);
    }
  }

  return (
    <section className="card">
      <div className="cardHeader">
        <h2>Contract Addresses</h2>
        <p>Deploy the contracts in Remix, then paste each deployed address here.</p>
      </div>
      
      <div className="grid two compact">
        {Object.entries(CONTRACTS).map(([key, config]) => (
          <label key={key} className="field">
            <span>{config.label}</span>
            <input
              type="text"
              value={addresses[key] || ''}
              onChange={(e) => updateAddress(key, e.target.value)}
              placeholder={`Paste ${config.label} address`}
            />
          </label>
        ))}
      </div>
      
      <div className={`statusIndicator ${addressesReady ? 'ok' : 'warn'}`} style={{ marginTop: '24px', marginBottom: '24px' }}>
        <div className="indicatorDot"></div>
        {addressesReady ? 'All addresses look valid.' : 'Waiting for valid Ethereum addresses.'}
      </div>
      
      <button 
        disabled={!addressesReady} 
        onClick={() => onReady(addresses)}
      >
        Load Contracts
      </button>
    </section>
  );
}
