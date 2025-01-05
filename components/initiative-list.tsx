'use client';

import { useEffect, useState } from 'react';
import { Initiative } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export function InitiativeList() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    const fetchInitiatives = async () => {
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
    };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Initiatives</h2>
        {address && (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Initiative
          </Button>
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