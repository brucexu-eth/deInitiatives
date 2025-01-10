import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth';
import { z } from 'zod';

// Mark route as dynamic
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
      const body = voteSchema.parse(json);

      // Check if item exists and belongs to the topic
      const item = await prisma.item.findFirst({
        where: {
          id: params.itemId,
          topicId: params.id,
        },
      });

      if (!item) {
        return NextResponse.json(
          { error: 'Item not found in this topic' },
          { status: 404 }
        );
      }

      // Create or update vote using upsert
      const vote = await prisma.$transaction(async (tx) => {
        const existingVote = await tx.vote.findUnique({
          where: {
            itemId_voter: {
              itemId: params.itemId,
              voter: address,
            },
          },
        });

        // If vote exists and type is the same, remove the vote
        if (existingVote?.voteType === body.type) {
          await tx.vote.delete({
            where: {
              itemId_voter: {
                itemId: params.itemId,
                voter: address,
              },
            },
          });

          // Update vote counts
          const updatedItem = await tx.item.update({
            where: { id: params.itemId },
            data: {
              upVotes:
                body.type === 'up'
                  ? { decrement: 1 }
                  : undefined,
              downVotes:
                body.type === 'down'
                  ? { decrement: 1 }
                  : undefined,
            },
          });

          return { action: 'removed', item: updatedItem };
        }

        // If vote exists but type is different, update the vote
        if (existingVote) {
          await tx.vote.update({
            where: {
              itemId_voter: {
                itemId: params.itemId,
                voter: address,
              },
            },
            data: {
              voteType: body.type,
            },
          });

          // Update vote counts
          const updatedItem = await tx.item.update({
            where: { id: params.itemId },
            data: {
              upVotes:
                body.type === 'up'
                  ? { increment: 1 }
                  : { decrement: 1 },
              downVotes:
                body.type === 'down'
                  ? { increment: 1 }
                  : { decrement: 1 },
            },
          });

          return { action: 'changed', item: updatedItem };
        }

        // If no vote exists, create a new vote
        await tx.vote.create({
          data: {
            itemId: params.itemId,
            voter: address,
            voteType: body.type,
          },
        });

        // Update vote counts
        const updatedItem = await tx.item.update({
          where: { id: params.itemId },
          data: {
            upVotes:
              body.type === 'up'
                ? { increment: 1 }
                : undefined,
            downVotes:
              body.type === 'down'
                ? { increment: 1 }
                : undefined,
          },
        });

        return { action: 'added', item: updatedItem };
      });

      return NextResponse.json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors[0].message },
          { status: 400 }
        );
      }

      console.error('Error voting:', error);
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
  });
}
