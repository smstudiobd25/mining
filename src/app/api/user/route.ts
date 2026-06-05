import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        miningSessions: { orderBy: { createdAt: 'desc' }, take: 5 },
        _count: {
          select: {
            referralsMade: true,
            notifications: { where: { isRead: false } },
            taskCompletions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Account is banned' }, { status: 403 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      roleId: user.roleId,
      role: user.role,
      nxrBalance: user.nxrBalance,
      vaultBalance: user.vaultBalance,
      miningDays: user.miningDays,
      tasksCompleted: user.tasksCompleted,
      streak: user.streak,
      bestStreak: user.bestStreak,
      referralCode: user.referralCode,
      lastMiningDate: user.lastMiningDate,
      adViewsToday: user.adViewsToday,
      lastAdViewDate: user.lastAdViewDate,
      miningSessions: user.miningSessions,
      referralCount: user._count.referralsMade,
      unreadNotifications: user._count.notifications,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatar } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      roleId: user.roleId,
      role: user.role,
      nxrBalance: user.nxrBalance,
      vaultBalance: user.vaultBalance,
      miningDays: user.miningDays,
      tasksCompleted: user.tasksCompleted,
      streak: user.streak,
      bestStreak: user.bestStreak,
      referralCode: user.referralCode,
    });
  } catch (error) {
    console.error('User POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
