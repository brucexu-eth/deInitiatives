'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { CreateItemDialog } from '@/components/create-item-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Vote {
  id: string;
  voteType: 'up' | 'down';
  voter: string;
}

interface Item {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  votes: Vote[];
  _count: {
    votes: {
      up: number;
      down: number;
    };
  };
}

interface Initiative {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  items: Item[];
}

export default function InitiativeDetailPage() {
  const params = useParams();
  const { toast } = useToast();
  const { address } = useAccount();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [votingItemId, setVotingItemId] = useState<string | null>(null);

  const fetchInitiative = async () => {
    try {
      const response = await fetch(`/api/initiatives/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch initiative');
      }
      const data = await response.json();
      setInitiative(data);
    } catch (error) {
      console.error('Error fetching initiative:', error);
      toast({
        title: 'Error',
        description: 'Failed to load initiative',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (itemId: string, type: 'up' | 'down') => {
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setVotingItemId(itemId);
    try {
      const response = await fetch(
        `/api/initiatives/${params.id}/items/${itemId}/vote`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            voter: address,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      await fetchInitiative();
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Vote recorded successfully',
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to vote',
        variant: 'destructive',
      });
    } finally {
      setVotingItemId(null);
    }
  };

  useEffect(() => {
    fetchInitiative();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 mx-auto">
        <div className="text-center">Loading initiative...</div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="container max-w-4xl py-8 mx-auto">
        <div className="text-center">Initiative not found</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 mx-auto">
      <Link
        href="/initiatives"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Initiatives
      </Link>

      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            <ReactMarkdown className="prose dark:prose-invert max-w-none inline">{initiative.title}</ReactMarkdown>
          </h1>
          <div className="text-sm text-muted-foreground">
            Created by {initiative.createdBy.slice(0, 6)}...{initiative.createdBy.slice(-4)}{' '}
            {formatDistanceToNow(new Date(initiative.createdAt))} ago
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{initiative.description}</ReactMarkdown>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Items</h2>
            <CreateItemDialog
              initiativeId={params.id}
              onItemCreated={fetchInitiative}
            />
          </div>

          <div className="space-y-4">
            {initiative.items.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <div className="text-muted-foreground">No items yet</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Create the first item for this initiative
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 rounded-lg border">
                {initiative.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-start p-4 rounded-lg border bg-card"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => handleVote(item.id, 'up')}
                        disabled={votingItemId === item.id}
                        className={cn(
                          'p-1 rounded hover:bg-muted transition-colors',
                          item.votes.some(
                            (v) => v.voter === address && v.voteType === 'up'
                          ) && 'text-green-600'
                        )}
                      >
                        <ChevronUp className="h-6 w-6" />
                      </button>
                      <span
                        className={cn(
                          'text-sm tabular-nums',
                          votingItemId === item.id && 'opacity-50'
                        )}
                      >
                        {item._count.votes.up}
                      </span>
                      <button
                        onClick={() => handleVote(item.id, 'down')}
                        disabled={votingItemId === item.id}
                        className={cn(
                          'p-1 rounded hover:bg-muted transition-colors',
                          item.votes.some(
                            (v) => v.voter === address && v.voteType === 'down'
                          ) && 'text-red-600'
                        )}
                      >
                        <ChevronDown className="h-6 w-6" />
                      </button>
                      <span
                        className={cn(
                          'text-sm tabular-nums',
                          votingItemId === item.id && 'opacity-50'
                        )}
                      >
                        {item._count.votes.down}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{item.title}</ReactMarkdown>
                      </div>
                      {item.description && (
                        <div className="mt-1 prose dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{item.description}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
