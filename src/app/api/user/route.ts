import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        miningSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        referralReceived: true,
        _count: {
          select: {
            referralsMade: true,
            taskCompletions: true,
            notifications: { where: { isRead: false } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Account has been banned' }, { status: 403 });
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, avatar } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true },
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser, message: 'Profile updated' });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
