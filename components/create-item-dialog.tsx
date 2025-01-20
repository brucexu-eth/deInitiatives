'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccount } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateItemDialogProps {
  topicId: string;
  onItemCreated?: () => void;
}

export function CreateItemDialog({
  topicId,
  onItemCreated,
}: CreateItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address } = useAccount();
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and sign in',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/topics/${topicId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }

      toast({
        title: 'Success',
        description: 'Item created successfully',
      });

      form.reset();
      setOpen(false);
      router.refresh(); // 刷新页面数据
      onItemCreated?.(); // Call the callback if provided
    } catch (error) {
      console.error('Error creating item:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Add a new item to this topic. Title and description support Markdown
            formatting.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => {
                const titleValue = field.value;
                return (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter item title"
                        className="h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Preview:
                      <div className="mt-2 p-2 border rounded-md prose prose-sm max-h-40 overflow-y-auto">
                        <ReactMarkdown>
                          {titleValue || 'No content'}
                        </ReactMarkdown>
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => {
                const descValue = field.value;
                return (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter item description"
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Preview:
                      <div className="mt-2 p-2 border rounded-md prose prose-sm max-h-40 overflow-y-auto">
                        <ReactMarkdown>
                          {descValue || 'No content'}
                        </ReactMarkdown>
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
