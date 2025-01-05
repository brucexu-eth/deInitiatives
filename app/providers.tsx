'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultConfig,
  connectorsForWallets,
  Wallet,
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider, useAccount } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import '@rainbow-me/rainbowkit/styles.css';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
}

const config = getDefaultConfig({
  appName: 'deInitiatives',
  projectId,
  chains: [mainnet, sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

function WalletAuthWrapper({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { login, token } = useAuth();

  React.useEffect(() => {
    if (isConnected && address && !token) {
      login().catch(console.error);
    }
  }, [isConnected, address, token, login]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletAuthWrapper>{children}</WalletAuthWrapper>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
