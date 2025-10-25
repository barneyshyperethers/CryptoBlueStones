import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WalletProvider } from '@/contexts/WalletContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MetaMask Wallet Connection',
  description: 'Simple MetaMask wallet connection with React Context',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
