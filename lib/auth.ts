import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { isAdmin } from './permissions';

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, address: string) => Promise<NextResponse>
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    return handler(request, payload.address);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (req: NextRequest, address: string) => Promise<NextResponse>
) {
  return withAuth(request, async (req, address) => {
    if (!isAdmin(address)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    return handler(req, address);
  });
}
