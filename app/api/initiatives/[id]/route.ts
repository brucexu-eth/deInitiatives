import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { canEditInitiative } from '@/lib/permissions';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const initiative = await prisma.initiative.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            votes: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
      },
    });

    if (!initiative) {
      return NextResponse.json(
        { error: 'Initiative not found' },
        { status: 404 }
      );
    }

    // Transform the data to include up and down vote counts
    const transformedInitiative = {
      ...initiative,
      items: initiative.items.map((item) => ({
        ...item,
        _count: {
          votes: {
            up: item.votes.filter((v) => v.voteType === 'up').length,
            down: item.votes.filter((v) => v.voteType === 'down').length,
          },
        },
      })),
    };

    return NextResponse.json(transformedInitiative);
  } catch (error) {
    console.error('Error fetching initiative:', error);
    return NextResponse.json(
      { error: 'Failed to fetch initiative' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, address) => {
    try {
      const initiative = await prisma.initiative.findUnique({
        where: { id: params.id },
        select: { createdBy: true },
      });

      if (!initiative) {
        return NextResponse.json(
          { error: 'Initiative not found' },
          { status: 404 }
        );
      }

      // Check if user has permission to edit
      if (!canEditInitiative(address, initiative.createdBy)) {
        return NextResponse.json(
          { error: 'You do not have permission to edit this initiative' },
          { status: 403 }
        );
      }

      const json = await req.json();
      const body = updateSchema.parse(json);

      const updatedInitiative = await prisma.initiative.update({
        where: { id: params.id },
        data: {
          title: body.title,
          description: body.description,
        },
      });

      return NextResponse.json(updatedInitiative);
    } catch (error) {
      console.error('Error updating initiative:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update initiative' },
        { status: 500 }
      );
    }
  });
}
