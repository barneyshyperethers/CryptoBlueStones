'use client';

import React from 'react';
import WalletConnect from '@/components/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';
import Link from 'next/link';

export default function Home() {
  const { isConnected, address } = useWallet();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              MetaMask Wallet Connection
            </h1>
            <p className="text-lg text-gray-600">
              Simple wallet connection using React Context
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Connect Your Wallet
            </h2>
            <WalletConnect />
          </div>

          {isConnected && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Wallet Information
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">
                    ✅ Wallet Connected Successfully!
                  </h3>
                  <p className="text-sm text-green-700">
                    Your wallet is now connected and the state is managed by React Context.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Wallet Address
                  </h3>
                  <p className="text-sm font-mono text-blue-600 break-all">
                    {address}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Test Context Persistence
            </h2>
            <p className="text-gray-600 mb-4">
              Navigate to different pages to see that your wallet connection state persists across the app.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/page1"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Page 1
              </Link>
              <Link 
                href="/page2"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to Page 2
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
