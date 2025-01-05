'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

interface RequireWalletProps {
  children: React.ReactNode;
  className?: string;
}

export function RequireWallet({ children, className }: RequireWalletProps) {
  const { isConnected } = useAccount();
  const [showDialog, setShowDialog] = useState(false);

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        className={className}
      >
        {/* Pass through the button content */}
        {children}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <p className="text-center text-muted-foreground">
              Please connect your wallet to perform this action
            </p>
            <ConnectButton />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
