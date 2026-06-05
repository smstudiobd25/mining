import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all';
    const userId = searchParams.get('userId');

    let dateFilter: Date | null = null;
    const now = new Date();

    switch (period) {
      case 'daily':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // For simplicity, rank by total NXR balance
    // For daily/weekly/monthly, we could track mining rewards in that period
    const users = await db.user.findMany({
      where: {
        isBanned: false,
        ...(dateFilter ? { createdAt: { gte: dateFilter } } : {}),
      },
      include: { role: true },
      orderBy: { nxrBalance: 'desc' },
      take: 100,
    });

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name,
      nxrBalance: u.nxrBalance,
      role: u.role,
      miningDays: u.miningDays,
      isCurrentUser: u.id === userId,
    }));

    return NextResponse.json({ leaderboard, period });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
