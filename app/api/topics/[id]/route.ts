import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withOptionalAuth } from '@/lib/auth';
import { z } from 'zod';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

const updateTopicSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['active', 'completed', 'cancelled']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withOptionalAuth(request, async (req, address) => {
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: params.id },
        include: {
          items: {
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              _count: {
                select: {
                  votes: true,
                },
              },
            },
          },
        },
      });

      if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }

      // If user is authenticated, include their votes
      if (address) {
        const votes = await prisma.vote.findMany({
          where: {
            voter: address,
            item: {
              topicId: params.id,
            },
          },
        });

        const voteMap = votes.reduce((acc, vote) => {
          acc[vote.itemId] = vote.voteType;
          return acc;
        }, {} as Record<string, string>);

        // Add user's vote to each item
        const itemsWithVotes = topic.items.map((item) => ({
          ...item,
          userVote: voteMap[item.id] || null,
        }));

        return NextResponse.json({
          ...topic,
          items: itemsWithVotes,
        });
      }

      return NextResponse.json(topic);
    } catch (error) {
      console.error('Error fetching topic:', error);
      return NextResponse.json(
        { error: 'Failed to fetch topic' },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, address) => {
    try {
      const json = await req.json();
      const body = updateTopicSchema.parse(json);

      // Check if topic exists and user is the creator
      const existingTopic = await prisma.topic.findUnique({
        where: { id: params.id },
      });

      if (!existingTopic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }

      if (existingTopic.createdBy.toLowerCase() !== address.toLowerCase()) {
        return NextResponse.json(
          { error: 'Not authorized to update this topic' },
          { status: 403 }
        );
      }

      const topic = await prisma.topic.update({
        where: { id: params.id },
        data: {
          title: body.title,
          description: body.description,
          status: body.status,
        },
      });

      return NextResponse.json(topic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors[0].message },
          { status: 400 }
        );
      }

      console.error('Error updating topic:', error);
      return NextResponse.json(
        { error: 'Failed to update topic' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, address) => {
    try {
      // Check if topic exists and user is the creator
      const existingTopic = await prisma.topic.findUnique({
        where: { id: params.id },
      });

      if (!existingTopic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }

      if (existingTopic.createdBy.toLowerCase() !== address.toLowerCase()) {
        return NextResponse.json(
          { error: 'Not authorized to delete this topic' },
          { status: 403 }
        );
      }

      await prisma.topic.delete({
        where: { id: params.id },
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting topic:', error);
      return NextResponse.json(
        { error: 'Failed to delete topic' },
        { status: 500 }
      );
    }
  });
}
