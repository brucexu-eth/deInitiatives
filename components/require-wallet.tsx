'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';

interface RequireWalletProps {
  children: React.ReactNode;
  showConnectButton?: boolean;
}

export function RequireWallet({ children, showConnectButton = true }: RequireWalletProps) {
  const { address } = useAccount();

  if (!address && !showConnectButton) {
    return null;
  }

  if (!address) {
    return <ConnectButton />;
  }

  return <>{children}</>;
}

export { Button };
