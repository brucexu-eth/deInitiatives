import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const voteSchema = z.object({
  type: z.enum(['up', 'down']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  return withAuth(request, async (req, address) => {
    try {
      const json = await req.json();
      console.log('Received vote request:', json);
      
      const body = voteSchema.parse(json);

      const existingVote = await prisma.vote.findFirst({
        where: {
          itemId: params.itemId,
          voter: address,
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
            voter: address,
            itemId: params.itemId,
          },
        });
      }

      // Get updated vote counts
      const voteCounts = await prisma.vote.groupBy({
        by: ['voteType'],
        where: {
          itemId: params.itemId,
        },
        _count: true,
      });

      const upVotes = voteCounts.find((v) => v.voteType === 'up')?._count ?? 0;
      const downVotes = voteCounts.find((v) => v.voteType === 'down')?._count ?? 0;

      return NextResponse.json({
        upVotes,
        downVotes,
        userVote: existingVote?.voteType === body.type ? null : body.type,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Error processing vote:', error);
      return NextResponse.json(
        { error: 'Failed to process vote' },
        { status: 500 }
      );
    }
  });
}
