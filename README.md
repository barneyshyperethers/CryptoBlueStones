# MetaMask Wallet Connection

A simple Next.js application that demonstrates MetaMask wallet connection using React Context for state management.

## Features

- 🔗 **MetaMask Detection**: Automatically detects if MetaMask is installed
- 🎯 **Simple Connection**: One-click wallet connection
- 🔄 **State Persistence**: Wallet state persists across page navigation
- 📱 **Responsive Design**: Works on desktop and mobile
- ⚡ **Real-time Updates**: Automatically handles account changes

## Tech Stack

- **Next.js 14** (App Router)
- **React 18** with Context API
- **TypeScript** for type safety
- **ethers.js** for Ethereum interactions

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Connect Your Wallet

1. Make sure you have MetaMask installed in your browser
2. Click the "Connect Wallet" button
3. Approve the connection in MetaMask
4. Your wallet address will be displayed in shortened format

## How It Works

### Wallet Connection Flow

1. **Click "Connect Wallet"** → Checks if MetaMask is installed
2. **MetaMask Not Installed** → Shows "Please install MetaMask to continue."
3. **MetaMask Installed** → Opens MetaMask connection prompt
4. **Connection Successful** → Shows "Connected: 0x8200...4940"
5. **State Persistence** → Wallet state maintained across all pages

### React Context Features

- **Global State**: Wallet connection state available throughout the app
- **Automatic Updates**: Listens for account changes in MetaMask
- **Error Handling**: Displays helpful error messages
- **Loading States**: Shows loading indicator during connection

## Project Structure

```
├── app/
│   ├── page.tsx          # Home page
│   ├── page1/page.tsx    # Demo page 1
│   ├── page2/page.tsx    # Demo page 2
│   ├── layout.tsx        # Root layout with WalletProvider
│   └── globals.css       # Global styles
├── components/
│   └── WalletConnect.tsx # Wallet connection component
├── contexts/
│   └── WalletContext.tsx # Wallet state management
├── types/
│   └── wallet.ts         # TypeScript definitions
└── package.json
```

## Usage

### Using the Wallet Context

```typescript
import { useWallet } from '@/contexts/WalletContext';

function MyComponent() {
  const {
    address,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet
  } = useWallet();

  if (isConnected) {
    return <div>Connected: {address}</div>;
  }

  return <button onClick={connectWallet}>Connect Wallet</button>;
}
```

### Wallet State

The context provides the following state:

- `address`: Connected wallet address (string | null)
- `isConnected`: Whether wallet is connected (boolean)
- `isLoading`: Whether connection is in progress (boolean)
- `error`: Error message if connection fails (string | null)

### Methods

- `connectWallet()`: Initiates wallet connection
- `disconnectWallet()`: Disconnects wallet and clears state

## Features Demonstrated

- ✅ MetaMask detection and connection
- ✅ React Context for global state
- ✅ Cross-page state persistence
- ✅ Account change detection
- ✅ Error handling and user feedback
- ✅ TypeScript type safety
- ✅ Responsive design

## Requirements Met

- ✅ "Connect Wallet" button
- ✅ MetaMask installation check
- ✅ Connection prompt using `eth_requestAccounts`
- ✅ Truncated address display
- ✅ Context state persistence
- ✅ TypeScript implementation
- ✅ Cross-page navigation testing

## Browser Compatibility

- Chrome (with MetaMask extension)
- Firefox (with MetaMask extension)
- Edge (with MetaMask extension)
- Safari (with MetaMask extension)

## Troubleshooting

### MetaMask Not Detected
- Ensure MetaMask extension is installed and enabled
- Refresh the page after installing MetaMask
- Check that you're on a supported browser

### Connection Fails
- Make sure MetaMask is unlocked
- Check that you have accounts in MetaMask
- Try refreshing the page and connecting again

## License

MIT License - feel free to use this code in your projects!
