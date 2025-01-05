import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withOptionalAuth } from '@/lib/auth';
import { z } from 'zod';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

const initiativeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
});

export async function GET(request: NextRequest) {
  return withOptionalAuth(request, async (req, address) => {
    try {
      const initiatives = await prisma.initiative.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
      });

      return NextResponse.json(initiatives);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
      return NextResponse.json(
        { error: 'Failed to fetch initiatives' },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, address) => {
    try {
      const json = await req.json();
      const body = initiativeSchema.parse(json);

      const initiative = await prisma.initiative.create({
        data: {
          title: body.title,
          description: body.description,
          createdBy: address,
        },
      });

      return NextResponse.json(initiative, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Error creating initiative:', error);
      return NextResponse.json(
        { error: 'Failed to create initiative' },
        { status: 500 }
      );
    }
  });
}
