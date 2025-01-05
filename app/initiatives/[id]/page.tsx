'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { CreateItemDialog } from '@/components/create-item-dialog';
import { EditInitiativeDialog } from '@/components/edit-initiative-dialog';
import { EditItemStatusDialog } from '@/components/edit-item-status-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { canEditInitiative, canEditItemStatus } from '@/lib/permissions';
import { VoteButton } from '@/components/vote-button';

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
  score: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface Initiative {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  items: Item[];
}

// Status display helper
function getStatusDisplay(status: Item['status']): { label: string; color: string } {
  switch (status) {
    case 'active':
      return { label: 'In Progress', color: 'blue' };
    case 'completed':
      return { label: 'Completed', color: 'green' };
    case 'cancelled':
      return { label: 'Cancelled', color: 'red' };
  }
}

export default function InitiativeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { address } = useAccount();
  const { token } = useAuth();
  const { toast } = useToast();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [votingItemId, setVotingItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitiative = useCallback(async () => {
    try {
      const response = await fetch(`/api/initiatives/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch initiative');
      }
      const data = await response.json();
      setInitiative(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch initiative',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [params.id, toast]);

  const handleVote = async (itemId: string, type: 'up' | 'down') => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and sign in',
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
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ type }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      await fetchInitiative();
      
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
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-bold">
              <ReactMarkdown className="prose dark:prose-invert max-w-none inline">
                {initiative.title}
              </ReactMarkdown>
            </h1>
            {address && canEditInitiative(address, initiative.createdBy) && (
              <EditInitiativeDialog
                initiative={initiative}
                onInitiativeUpdated={fetchInitiative}
              />
            )}
          </div>
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
                    className={cn(
                      'p-4 rounded-lg border',
                      item.status === 'completed' && 'bg-muted/50',
                      item.status === 'cancelled' && 'bg-destructive/10'
                    )}
                  >
                    <div className="flex gap-4">
                      {/* Vote buttons */}
                      <div className="flex items-center gap-2">
                        <VoteButton
                          type="up"
                          count={item._count.votes.up}
                          isVoted={item.votes.some(
                            (v) => v.voter === address && v.voteType === 'up'
                          )}
                          isDisabled={
                            votingItemId === item.id ||
                            item.status !== 'active'
                          }
                          onClick={() => handleVote(item.id, 'up')}
                        />
                        <VoteButton
                          type="down"
                          count={item._count.votes.down}
                          isVoted={item.votes.some(
                            (v) => v.voter === address && v.voteType === 'down'
                          )}
                          isDisabled={
                            votingItemId === item.id ||
                            item.status !== 'active'
                          }
                          onClick={() => handleVote(item.id, 'down')}
                        />
                      </div>

                      {/* Item content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {/* Score badge */}
                              <div className={cn(
                                'px-1.5 py-0.5 rounded-md text-xs font-medium tabular-nums border min-w-[3ch] text-center',
                                item.score > 0 && 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300',
                                item.score < 0 && 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300',
                                item.score === 0 && 'bg-muted border-muted-foreground/20 text-muted-foreground'
                              )}>
                                {item.score > 0 && '+'}
                                {item.score}
                              </div>
                              <h3 className="font-medium leading-none">
                                {item.title}
                              </h3>
                              {/* Status badge */}
                              <div className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                getStatusDisplay(item.status).color === 'blue' && 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                                getStatusDisplay(item.status).color === 'green' && 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
                                getStatusDisplay(item.status).color === 'red' && 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                              )}>
                                {getStatusDisplay(item.status).label}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Created {formatDistanceToNow(new Date(item.createdAt))} ago
                            </div>
                          </div>
                          {address === initiative.createdBy && (
                            <EditItemStatusDialog
                              initiativeId={initiative.id}
                              item={item}
                              onItemUpdated={fetchInitiative}
                            />
                          )}
                        </div>
                        {item.description && (
                          <div className="mt-2 prose dark:prose-invert">
                            <ReactMarkdown>{item.description}</ReactMarkdown>
                          </div>
                        )}
                      </div>
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
