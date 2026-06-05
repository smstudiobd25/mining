import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'start') {
      // Check if there's an active/unfinished mining session
      const activeSession = await db.miningSession.findFirst({
        where: {
          userId,
          claimed: false,
          endsAt: { gt: new Date() },
        },
      });

      if (activeSession) {
        return NextResponse.json({
          error: 'Mining session already active',
          session: activeSession,
        }, { status: 400 });
      }

      // Check if there's an unclaimed finished session
      const unclaimedSession = await db.miningSession.findFirst({
        where: {
          userId,
          claimed: false,
          endsAt: { lte: new Date() },
        },
      });

      if (unclaimedSession) {
        return NextResponse.json({
          error: 'You have an unclaimed reward. Claim it first!',
          session: unclaimedSession,
        }, { status: 400 });
      }

      // Get mining duration from settings
      const durationSetting = await db.setting.findUnique({ where: { key: 'mining_duration_hours' } });
      const durationHours = durationSetting ? parseFloat(durationSetting.value) : 24;

      // Get base mining reward from settings
      const rewardSetting = await db.setting.findUnique({ where: { key: 'base_mining_reward' } });
      const baseReward = rewardSetting ? parseFloat(rewardSetting.value) : 50;

      // Apply role mining boost
      const rewardAmount = baseReward * (user.role?.miningBoost || 1.0);

      const now = new Date();
      const endsAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

      const session = await db.miningSession.create({
        data: {
          userId,
          startedAt: now,
          endsAt,
          rewardAmount,
        },
      });

      // Create notification
      await db.notification.create({
        data: {
          userId,
          title: 'Mining Started!',
          message: `Mining session started. You'll earn ${rewardAmount.toFixed(1)} NXR in ${durationHours} hours.`,
          type: 'mining',
        },
      });

      return NextResponse.json({ session, message: 'Mining started!' });
    }

    if (action === 'claim') {
      const { sessionId } = body;

      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
      }

      const session = await db.miningSession.findUnique({
        where: { id: sessionId },
      });

      if (!session || session.userId !== userId) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      if (session.claimed) {
        return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 });
      }

      if (new Date() < new Date(session.endsAt)) {
        return NextResponse.json({ error: 'Mining session not finished yet' }, { status: 400 });
      }

      // Claim reward
      await db.miningSession.update({
        where: { id: sessionId },
        data: { claimed: true, claimedAt: new Date() },
      });

      // Get task multiplier
      const taskMultiplierSetting = await db.setting.findUnique({ where: { key: 'task_multiplier' } });
      const taskMultiplier = taskMultiplierSetting ? parseFloat(taskMultiplierSetting.value) : 1;

      // Get vault multiplier
      const vaultMultiplierSetting = await db.setting.findUnique({ where: { key: 'vault_multiplier' } });
      const vaultMultiplier = vaultMultiplierSetting ? parseFloat(vaultMultiplierSetting.value) : 1;

      const nxrReward = session.rewardAmount * taskMultiplier;
      const vaultReward = 0.02 * vaultMultiplier;

      // Update user balance
      const today = new Date().toISOString().split('T')[0];
      const lastMiningDate = user.lastMiningDate;
      let newStreak = user.streak;

      if (lastMiningDate) {
        const lastDate = new Date(lastMiningDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate.toDateString() === yesterday.toDateString()) {
          newStreak += 1;
        } else if (lastDate.toDateString() !== new Date().toDateString()) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      await db.user.update({
        where: { id: userId },
        data: {
          nxrBalance: { increment: nxrReward },
          vaultBalance: { increment: vaultReward },
          miningDays: { increment: 1 },
          lastMiningDate: today,
          streak: newStreak,
        },
      });

      // Add vault reward
      const activeCampaign = await db.rewardVaultCampaign.findFirst({ where: { isActive: true } });
      if (activeCampaign) {
        await db.vaultReward.create({
          data: {
            userId,
            campaignId: activeCampaign.id,
            amount: vaultReward,
          },
        });
      }

      // Create notification
      await db.notification.create({
        data: {
          userId,
          title: 'Mining Reward Claimed!',
          message: `You claimed ${nxrReward.toFixed(1)} NXR and $${vaultReward.toFixed(2)} vault reward! ${newStreak > 1 ? `🔥 ${newStreak}-day streak!` : ''}`,
          type: 'reward',
        },
      });

      return NextResponse.json({
        reward: { nxr: nxrReward, vault: vaultReward },
        streak: newStreak,
        message: 'Reward claimed successfully!',
      });
    }

    if (action === 'status') {
      const activeSession = await db.miningSession.findFirst({
        where: {
          userId,
          claimed: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ session: activeSession });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Mining error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
