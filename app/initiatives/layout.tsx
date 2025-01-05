'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function InitiativesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="container max-w-4xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to DeInitiatives</h1>
        <p className="text-muted-foreground mb-8">
          Connect your wallet to view and create initiatives
        </p>
        <ConnectButton />
      </div>
    );
  }

  return children;
}
