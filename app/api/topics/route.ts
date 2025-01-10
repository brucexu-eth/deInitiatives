import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withOptionalAuth } from '@/lib/auth';
import { z } from 'zod';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

const topicSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
});

export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (req, address) => {
    try {
      const topics = await prisma.topic.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      return NextResponse.json(topics);
    } catch (error) {
      console.error('Error fetching topics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch topics' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, address) => {
    try {
      const json = await req.json();
      const body = topicSchema.parse(json);

      const topic = await prisma.topic.create({
        data: {
          title: body.title,
          description: body.description,
          createdBy: address,
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

      console.error('Error creating topic:', error);
      return NextResponse.json(
        { error: 'Failed to create topic' },
        { status: 500 }
      );
    }
  });
}
