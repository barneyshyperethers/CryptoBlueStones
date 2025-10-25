'use client';

import React from 'react';
import WalletConnect from '@/components/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';
import Link from 'next/link';

export default function Page2() {
  const { isConnected, address } = useWallet();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Page 2
            </h1>
            <p className="text-lg text-gray-600">
              Another page to test context persistence
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Wallet Status
            </h2>
            <WalletConnect />
          </div>

          {isConnected && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Context Still Working!
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">
                    🚀 State Persistence Confirmed
                  </h3>
                  <p className="text-sm text-green-700">
                    Your wallet connection persists across all pages in the application.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-800 mb-2">
                    Wallet Address
                  </h3>
                  <p className="text-sm font-mono text-purple-600 break-all">
                    {address}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">
                    Features Demonstrated
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• React Context state management</li>
                    <li>• MetaMask wallet detection</li>
                    <li>• Cross-page state persistence</li>
                    <li>• Account change detection</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Navigation
            </h2>
            <div className="flex space-x-4">
              <Link 
                href="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Home
              </Link>
              <Link 
                href="/page1"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Page 1
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
