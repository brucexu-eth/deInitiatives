import { NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { createToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { signature, message, address } = await request.json();

    // Verify the signature
    const isValid = await verifyMessage({
      message,
      signature,
      address,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Extract nonce from message
    const nonce = message.split('Nonce: ')[1];
    
    // Verify nonce exists and belongs to the address
    const storedNonce = await prisma.authNonce.findFirst({
      where: {
        address,
        nonce,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Within last 5 minutes
        },
      },
    });

    if (!storedNonce) {
      return NextResponse.json(
        { error: 'Invalid or expired nonce' },
        { status: 400 }
      );
    }

    // Delete used nonce
    await prisma.authNonce.delete({
      where: { id: storedNonce.id },
    });

    // Generate JWT token
    const token = await createToken(address, nonce);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify signature' },
      { status: 500 }
    );
  }
}
