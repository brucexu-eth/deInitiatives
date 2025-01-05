import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
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
