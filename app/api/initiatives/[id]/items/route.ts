import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

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

      const initiative = await prisma.initiative.findUnique({
        where: { id: params.id },
      });

      if (!initiative) {
        return NextResponse.json(
          { error: 'Initiative not found' },
          { status: 404 }
        );
      }

      const item = await prisma.item.create({
        data: {
          title: body.title,
          description: body.description ?? '',
          createdBy: address,
          initiativeId: params.id,
        },
      });

      return NextResponse.json(item, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
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
