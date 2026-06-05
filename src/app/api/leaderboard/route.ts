import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    const userId = searchParams.get('userId');

    // For simplicity, we show all-time leaderboard based on NXR balance
    // In production, you'd filter by period
    const users = await db.user.findMany({
      where: { isBanned: false },
      select: {
        id: true,
        name: true,
        email: true,
        nxrBalance: true,
        miningDays: true,
        streak: true,
        roleId: true,
        role: {
          select: { name: true, color: true },
        },
      },
      orderBy: { nxrBalance: 'desc' },
      take: 100,
    });

    const leaderboard = users.map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name,
      email: u.email,
      nxrBalance: u.nxrBalance,
      miningDays: u.miningDays,
      streak: u.streak,
      role: u.role,
      isCurrentUser: u.id === userId,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
