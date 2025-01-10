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
import ReactMarkdown from 'react-markdown';

interface Topic {
  id: string;
  title: string;
  description: string;
  status: string;
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/topics/${topic.id}`, {
        method: 'DELETE',
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
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{topic.title}</ReactMarkdown>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Created by {topic.createdBy.slice(0, 6)}...
            {topic.createdBy.slice(-4)}
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
