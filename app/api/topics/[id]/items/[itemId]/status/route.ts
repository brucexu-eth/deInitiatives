import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withItemStatusAuth } from '@/lib/auth';
import { z } from 'zod';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

const updateItemStatusSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  return withItemStatusAuth(request, params.id, params.itemId, async (req, address) => {
    try {
      const json = await req.json();
      const body = updateItemStatusSchema.parse(json);

      const item = await prisma.item.update({
        where: { id: params.itemId },
        data: {
          status: body.status,
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

      console.error('Error updating item status:', error);
      return NextResponse.json(
        { error: 'Failed to update item status' },
        { status: 500 }
      );
    }
  });
}
