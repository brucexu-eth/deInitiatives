'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { RequireWallet } from './require-wallet';
import { CreateTopicDialog } from './create-topic-dialog';
import ReactMarkdown from 'react-markdown';

interface Topic {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  createdBy: string;
  _count: {
    items: number;
  };
}

export function TopicList() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected } = useAccount();
  const { token } = useAuth();

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics', {
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center py-16">Loading topics...</div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center py-16">
          <div className="mx-auto max-w-xl">
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No topics yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating a new topic for your community.
            </p>
            <div className="mt-6">
              <RequireWallet>
                <CreateTopicDialog onTopicCreated={fetchTopics} />
              </RequireWallet>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Topics</h2>
        </div>
        <RequireWallet>
          <CreateTopicDialog onTopicCreated={fetchTopics} />
        </RequireWallet>
      </div>

      <div className="space-y-4">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.id}`}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{topic.title}</ReactMarkdown>
                </div>
                <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                  <ReactMarkdown>{topic.description}</ReactMarkdown>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <div>{topic._count.items} items</div>
                  <div>
                    Created by {topic.createdBy.slice(0, 6)}...
                    {topic.createdBy.slice(-4)}
                  </div>
                </div>
              </div>
              <div className="text-gray-400">
                <PlusIcon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
