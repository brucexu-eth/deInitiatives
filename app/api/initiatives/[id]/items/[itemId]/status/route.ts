import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { canEditItemStatus } from '@/lib/permissions';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled']),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
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

    const json = await request.json();
    const body = updateSchema.parse(json);

    // Get user address from request headers
    const userAddress = request.headers.get('x-user-address');
    if (!userAddress) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!canEditItemStatus(userAddress)) {
      return NextResponse.json(
        { error: 'You do not have permission to edit item status' },
        { status: 403 }
      );
    }

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
}
