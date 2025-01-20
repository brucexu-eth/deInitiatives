'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button';
import { RequireWallet } from './require-wallet';
import { CreateItemDialog } from './create-item-dialog';
import { EditTopicDialog } from './edit-topic-dialog';
import { useAuth } from '@/hooks/useAuth';

import ReactMarkdown from 'react-markdown';

interface Topic {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

interface Props {
  topic: Topic;
}

export function TopicHeader({ topic }: Props) {
  const router = useRouter();
  const { address } = useAccount();
  const [isDeleting, setIsDeleting] = useState(false);
  const { token } = useAuth();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/topics/${topic.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete topic');
      }

      toast.success('Topic deleted successfully');
      router.push('/');
    } catch (error) {
      console.error('Error deleting topic:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete topic');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-4 prose prose-md max-w-none">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                topic.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : topic.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
            </span>
            <div className="w-px h-4 bg-gray-300"></div>
            <ReactMarkdown className="font-bold">{topic.title}</ReactMarkdown>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <span>
              Created by {topic.createdBy.slice(0, 6)}...
              {topic.createdBy.slice(-4)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RequireWallet>
            <CreateItemDialog topicId={topic.id} />
          </RequireWallet>
          {address?.toLowerCase() === topic.createdBy.toLowerCase() && (
            <>
              <EditTopicDialog topic={topic} />
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown>{topic.description}</ReactMarkdown>
      </div>
    </div>
  );
}
