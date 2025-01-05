'use client';

import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { RequireWallet } from '@/components/require-wallet';

interface VoteButtonProps {
  type: 'up' | 'down';
  count: number;
  isVoted: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export function VoteButton({
  type,
  count,
  isVoted,
  isDisabled,
  onClick,
}: VoteButtonProps) {
  const Icon = type === 'up' ? ChevronUp : ChevronDown;
  const colorClass = type === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="flex flex-col items-center gap-1">
      <RequireWallet>
        <button
          onClick={onClick}
          disabled={isDisabled}
          className={cn(
            'p-1 rounded hover:bg-muted transition-colors',
            isVoted && colorClass
          )}
        >
          <Icon className="h-6 w-6" />
        </button>
      </RequireWallet>
      <span
        className={cn(
          'text-sm tabular-nums',
          isDisabled && 'opacity-50'
        )}
      >
        {count}
      </span>
    </div>
  );
}
