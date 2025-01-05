'use client';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { publicProvider } from 'wagmi/providers/public';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');
}

const { chains, publicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'DAO Voting App',
  projectId,
  chains,
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}