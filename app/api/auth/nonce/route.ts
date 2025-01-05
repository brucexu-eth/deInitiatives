import { NextResponse } from 'next/server';
import { generateNonce } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const nonce = generateNonce();

  // Store nonce in database with expiration
  await prisma.authNonce.create({
    data: {
      nonce,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  return NextResponse.json({ nonce });
}
