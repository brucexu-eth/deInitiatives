'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { CreateInitiativeDialog } from './create-initiative-dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { RequireWallet } from '@/components/require-wallet';

interface Initiative {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  status: string;
  _count: {
    items: number;
  };
}

export function InitiativeList() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const { toast } = useToast();

  const fetchInitiatives = async () => {
    try {
      const response = await fetch('/api/initiatives');
      if (!response.ok) {
        throw new Error('Failed to fetch initiatives');
      }
      const data = await response.json();
      setInitiatives(data);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
      toast({
        title: 'Error',
        description: 'Failed to load initiatives',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitiatives();
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto">
        <div className="text-center py-16">Loading initiatives...</div>
      </div>
    );
  }

  if (initiatives.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 max-w-lg">
            <PlusCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No initiatives yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating a new initiative for your community.
            </p>
            <div className="mt-6">
              {address ? (
                <CreateInitiativeDialog onInitiativeCreated={fetchInitiatives} />
              ) : (
                <RequireWallet>
                  <Button>Connect Wallet to Create</Button>
                </RequireWallet>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Initiatives</h2>
          {address ? (
            <CreateInitiativeDialog onInitiativeCreated={fetchInitiatives} />
          ) : (
            <RequireWallet>
              <Button>Connect Wallet to Create</Button>
            </RequireWallet>
          )}
        </div>
        <div className="divide-y divide-gray-200 rounded-lg border bg-card">
          {initiatives.map((initiative) => (
            <Link
              key={initiative.id}
              href={`/initiatives/${initiative.id}`}
              className="block hover:bg-muted/50 transition-colors"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{initiative.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {initiative._count.items} items
                  </span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground flex items-center justify-between">
                  <div>{initiative.createdBy.slice(0, 6)}...{initiative.createdBy.slice(-4)}</div>
                  <div>{formatDistanceToNow(new Date(initiative.createdAt))} ago</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}