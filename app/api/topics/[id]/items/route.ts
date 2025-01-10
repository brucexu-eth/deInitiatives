import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

const itemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, address) => {
    try {
      const json = await req.json();
      const body = itemSchema.parse(json);

      // Check if topic exists
      const topic = await prisma.topic.findUnique({
        where: { id: params.id },
      });

      if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }

      const item = await prisma.item.create({
        data: {
          title: body.title,
          description: body.description || '',
          createdBy: address,
          topicId: params.id,
        },
      });

      return NextResponse.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors[0].message },
          { status: 400 }
        );
      }

      console.error('Error creating item:', error);
      return NextResponse.json(
        { error: 'Failed to create item' },
        { status: 500 }
      );
    }
  });
}
