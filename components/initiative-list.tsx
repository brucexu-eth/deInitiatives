'use client';

import { useEffect, useState } from 'react';
import { Initiative } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { PlusCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { CreateInitiativeDialog } from './create-initiative-dialog';

export function InitiativeList() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const { address } = useAccount();

  const fetchInitiatives = async () => {
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching initiatives:', error);
        return;
      }

      setInitiatives(data);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
    }
  };

  useEffect(() => {
    fetchInitiatives();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('initiatives')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'initiatives' }, 
        () => {
          fetchInitiatives();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (initiatives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 max-w-lg">
          <PlusCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No initiatives yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating a new initiative for your community.
          </p>
          <div className="mt-6">
            <CreateInitiativeDialog onInitiativeCreated={fetchInitiatives} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Initiatives</h2>
        {address && (
          <CreateInitiativeDialog onInitiativeCreated={fetchInitiatives} />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initiatives.map((initiative) => (
          <Link
            key={initiative.id}
            href={`/initiatives/${initiative.id}`}
            className="block"
          >
            <div className="p-6 rounded-lg border bg-card hover:border-primary transition-colors">
              <h3 className="text-xl font-semibold mb-2">
                <ReactMarkdown>{initiative.title}</ReactMarkdown>
              </h3>
              {initiative.description && (
                <div className="text-sm text-muted-foreground mb-4">
                  <ReactMarkdown>{initiative.description}</ReactMarkdown>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}