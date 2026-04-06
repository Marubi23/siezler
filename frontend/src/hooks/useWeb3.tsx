import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: number | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
  chainId: null
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
      
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  };

  useEffect(() => {
    // Check if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
      connect();
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, provider, signer, connect, disconnect, chainId }}>
      {children}
    </Web3Context.Provider>
  );
};

declare global {
  interface Window {
    ethereum: any;
  }
}