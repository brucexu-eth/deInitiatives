import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  return withAdminAuth(request, async (req, address) => {
    try {
      const item = await prisma.item.findUnique({
        where: {
          id: params.itemId,
          initiativeId: params.id,
        },
      });

      if (!item) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      const json = await req.json();
      const body = updateSchema.parse(json);

      const updatedItem = await prisma.item.update({
        where: {
          id: params.itemId,
          initiativeId: params.id,
        },
        data: {
          status: body.status,
        },
      });

      return NextResponse.json(updatedItem);
    } catch (error) {
      console.error('Error updating item status:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update item status' },
        { status: 500 }
      );
    }
  });
}
