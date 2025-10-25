'use client';

import React from 'react';
import WalletConnect from '@/components/WalletConnect';
import { useWallet } from '@/contexts/WalletContext';
import Link from 'next/link';

export default function Page1() {
  const { isConnected, address } = useWallet();

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Page 1
            </h1>
            <p className="text-lg text-gray-600">
              This page demonstrates context persistence
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
                Context Persistence Working!
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">
                    🎉 Wallet State Persisted
                  </h3>
                  <p className="text-sm text-green-700">
                    Your wallet connection is maintained across page navigation thanks to React Context!
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Connected Address
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
