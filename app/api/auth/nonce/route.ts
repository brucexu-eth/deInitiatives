import { NextResponse } from 'next/server';
import { generateNonce } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  const nonce = generateNonce();

  // Store nonce in database
  await prisma.authNonce.create({
    data: {
      nonce,
      address,
    },
  });

  return NextResponse.json({ nonce });
}
