'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function InitiativesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            DeInitiatives
          </Link>
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </header>
      <main>
        {!isConnected ? (
          <div className="container py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to DeInitiatives</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to view and create initiatives
            </p>
            <ConnectButton />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
