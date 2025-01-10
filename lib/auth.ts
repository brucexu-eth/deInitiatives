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

// Topic所有者认证中间件
export async function withTopicOwnerAuth(
  request: NextRequest,
  topicId: string,
  handler: AuthHandler
): Promise<NextResponse> {
  return withAuth(request, async (req, address) => {
    // 查找topic
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // 检查是否是topic的创建者
    if (topic.createdBy.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Not authorized to modify this topic' },
        { status: 403 }
      );
    }

    return handler(req, address);
  });
}

// Item状态修改认证中间件
export async function withItemStatusAuth(
  request: NextRequest,
  topicId: string,
  itemId: string,
  handler: AuthHandler
): Promise<NextResponse> {
  return withAuth(request, async (req, address) => {
    // 查找topic和item
    const [topic, item] = await Promise.all([
      prisma.topic.findUnique({
        where: { id: topicId },
      }),
      prisma.item.findUnique({
        where: { id: itemId },
      }),
    ]);

    if (!topic || !item) {
      return NextResponse.json(
        { error: 'Topic or item not found' },
        { status: 404 }
      );
    }

    // 检查权限
    if (!canEditItemStatus(address, topic.createdBy, item.createdBy)) {
      return NextResponse.json(
        { error: 'Not authorized to modify this item' },
        { status: 403 }
      );
    }

    return handler(req, address);
  });
}
