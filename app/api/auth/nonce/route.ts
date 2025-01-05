import { NextResponse } from 'next/server';
import { generateNonce } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const nonce = generateNonce();

    // Store nonce in database
    await prisma.authNonce.create({
      data: {
        address,
        nonce,
      },
    });

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}
