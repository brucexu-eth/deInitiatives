import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const voteSchema = z.object({
  type: z.enum(['up', 'down']),
  voter: z.string().min(1, 'Voter address is required'),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const json = await request.json();
    console.log('Received vote request:', json);
    
    const body = voteSchema.parse(json);

    const existingVote = await prisma.vote.findFirst({
      where: {
        itemId: params.itemId,
        voter: body.voter,
      },
    });

    if (existingVote) {
      if (existingVote.voteType === body.type) {
        // Remove vote if clicking the same type again
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Change vote type if clicking different type
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { voteType: body.type },
        });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          voteType: body.type,
          voter: body.voter,
          itemId: params.itemId,
        },
      });
    }

    // Get updated vote counts
    const votes = await prisma.vote.findMany({
      where: {
        itemId: params.itemId,
      },
    });

    const upVotes = votes.filter((v) => v.voteType === 'up').length;
    const downVotes = votes.filter((v) => v.voteType === 'down').length;

    return NextResponse.json({ upVotes, downVotes });
  } catch (error) {
    console.error('Error processing vote:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Check if the error is related to database constraints
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'You have already voted on this item' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process vote', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
