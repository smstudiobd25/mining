import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active mining session
    const activeSession = await db.miningSession.findFirst({
      where: {
        userId,
        claimed: false,
        endsAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get completed but unclaimed session
    const claimableSession = await db.miningSession.findFirst({
      where: {
        userId,
        claimed: false,
        endsAt: { lte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      activeSession,
      claimableSession,
      isMining: !!activeSession,
      canClaim: !!claimableSession,
    });
  } catch (error) {
    console.error('Mining GET error:', error);
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
    const { action } = body;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.isBanned) {
      return NextResponse.json({ error: 'User not found or banned' }, { status: 403 });
    }

    if (action === 'start') {
      // Check for existing active session
      const existingSession = await db.miningSession.findFirst({
        where: {
          userId,
          claimed: false,
          endsAt: { gt: new Date() },
        },
      });

      if (existingSession) {
        return NextResponse.json({ error: 'You already have an active mining session', session: existingSession }, { status: 400 });
      }

      // Get mining duration setting
      const durationSetting = await db.setting.findUnique({ where: { key: 'mining_duration_hours' } });
      const durationHours = durationSetting ? parseInt(durationSetting.value) : 24;

      const now = new Date();
      const endsAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

      const session = await db.miningSession.create({
        data: {
          userId,
          startedAt: now,
          endsAt,
        },
      });

      return NextResponse.json({
        session,
        message: 'Mining started!',
      });
    }

    if (action === 'claim') {
      // Find claimable session
      const session = await db.miningSession.findFirst({
        where: {
          userId,
          claimed: false,
          endsAt: { lte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!session) {
        return NextResponse.json({ error: 'No claimable session found' }, { status: 400 });
      }

      // Get settings
      const baseRewardSetting = await db.setting.findUnique({ where: { key: 'base_mining_reward' } });
      const streakBonusSetting = await db.setting.findUnique({ where: { key: 'streak_bonus' } });

      const baseReward = baseRewardSetting ? parseFloat(baseRewardSetting.value) : 50;
      const streakBonusPerDay = streakBonusSetting ? parseFloat(streakBonusSetting.value) : 5;
      const roleBoost = user.role?.miningBoost || 1.0;

      // Calculate streak
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let newStreak = user.streak;
      if (user.lastMiningDate === yesterday) {
        newStreak += 1;
      } else if (user.lastMiningDate !== today) {
        newStreak = 1;
      }

      const newBestStreak = Math.max(newStreak, user.bestStreak);

      // Calculate reward
      const streakBonus = (newStreak - 1) * streakBonusPerDay;
      const totalReward = Math.round((baseReward * roleBoost + streakBonus) * 100) / 100;

      // Mark session as claimed
      await db.miningSession.update({
        where: { id: session.id },
        data: {
          claimed: true,
          claimedAt: new Date(),
          rewardAmount: totalReward,
        },
      });

      // Update user
      await db.user.update({
        where: { id: userId },
        data: {
          nxrBalance: { increment: totalReward },
          miningDays: { increment: 1 },
          lastMiningDate: today,
          streak: newStreak,
          bestStreak: newBestStreak,
        },
      });

      // Create notification
      await db.notification.create({
        data: {
          userId,
          title: 'Mining Reward Claimed! 🎉',
          message: `You earned ${totalReward} NXR (${baseReward} × ${roleBoost}x boost + ${streakBonus} streak bonus). Streak: ${newStreak} days!`,
          type: 'mining',
        },
      });

      return NextResponse.json({
        reward: totalReward,
        baseReward,
        roleBoost,
        streakBonus,
        newStreak,
        newBestStreak,
        message: `Claimed ${totalReward} NXR!`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Mining POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
