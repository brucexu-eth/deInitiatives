import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

type AuthHandler = (
  req: NextRequest,
  address: string
) => Promise<NextResponse> | NextResponse;

// 基础认证中间件
export async function withAuth(
  req: NextRequest,
  handler: AuthHandler
): Promise<NextResponse> {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    return handler(req, payload.address);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Invalid authentication' },
      { status: 401 }
    );
  }
}

// Initiative所有者认证中间件
export async function withInitiativeOwnerAuth(
  req: NextRequest,
  initiativeId: string,
  handler: AuthHandler
): Promise<NextResponse> {
  return withAuth(req, async (req, address) => {
    // 查找initiative
    const initiative = await prisma.initiative.findUnique({
      where: { id: initiativeId },
    });

    if (!initiative) {
      return NextResponse.json(
        { error: 'Initiative not found' },
        { status: 404 }
      );
    }

    // 检查是否是initiative的创建者
    if (initiative.createdBy.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return handler(req, address);
  });
}
