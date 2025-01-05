'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b">
      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            DeInitiatives
          </Link>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
