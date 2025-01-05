import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { prisma } from './prisma';
import { canEditItemStatus } from './permissions';

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

// 可选认证中间件，不要求必须登录
export async function withOptionalAuth(
  req: NextRequest,
  handler: AuthHandler
): Promise<NextResponse> {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      // 如果没有token，传入空地址
      return handler(req, '');
    }

    const payload = await verifyToken(token);
    return handler(req, payload.address);
  } catch (error) {
    // 如果token无效，也传入空地址
    console.error('Authentication error:', error);
    return handler(req, '');
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

// Item状态编辑认证中间件
export async function withItemStatusAuth(
  req: NextRequest,
  initiativeId: string,
  itemId: string,
  handler: AuthHandler
): Promise<NextResponse> {
  return withAuth(req, async (req, address) => {
    // 查找initiative和item
    const [initiative, item] = await Promise.all([
      prisma.initiative.findUnique({
        where: { id: initiativeId },
      }),
      prisma.item.findUnique({
        where: { id: itemId },
      }),
    ]);

    if (!initiative || !item) {
      return NextResponse.json(
        { error: 'Initiative or item not found' },
        { status: 404 }
      );
    }

    // 检查权限
    if (!canEditItemStatus(address, initiative.createdBy, item.createdBy)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return handler(req, address);
  });
}
