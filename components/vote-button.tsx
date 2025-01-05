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
    <div className="flex items-center gap-1">
      <RequireWallet>
        <button
          onClick={onClick}
          disabled={isDisabled}
          className={cn(
            'p-1 rounded hover:bg-muted transition-colors',
            isVoted && colorClass,
            isDisabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      </RequireWallet>
      <span
        className={cn(
          'text-sm tabular-nums min-w-[2ch] text-center',
          isVoted && colorClass,
          isDisabled && 'opacity-50'
        )}
      >
        {count}
      </span>
    </div>
  );
}
