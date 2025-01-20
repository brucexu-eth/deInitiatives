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
import { mainnet, sepolia, optimism } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import '@rainbow-me/rainbowkit/styles.css';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
}

const config = getDefaultConfig({
  appName: 'Consensus',
  projectId,
  chains: [mainnet, sepolia, optimism],
  ssr: true,
});

const queryClient = new QueryClient();

function WalletAuthWrapper({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const { login, token, logout } = useAuth();
  const [prevAddress, setPrevAddress] = React.useState<string | undefined>(
    address
  );

  // 处理钱包切换
  React.useEffect(() => {
    if (address !== prevAddress && address !== undefined) {
      // 只有当新地址存在时才进行切换
      if (prevAddress) {
        console.log('Logging out due to wallet change');
        logout();
      }
      setPrevAddress(address);
    }
  }, [address, prevAddress, logout]);

  // 处理登录
  React.useEffect(() => {
    if (isConnected && address && !token) {
      console.log('Attempting to log in with address:', address);
      login().catch((error) => {
        console.error('Login failed:', error);
      });
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
