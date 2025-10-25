'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';

export default function WalletConnect() {
  const {
    address,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <button 
        disabled
        className="px-6 py-3 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
      >
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
          Connected: {formatAddress(address)}
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={connectWallet}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Connect Wallet
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
