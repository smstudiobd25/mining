import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    const where: Record<string, unknown> = { isActive: true };
    if (position) where.position = position;

    const ads = await db.adPlacement.findMany({ where });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Ads fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, adPlacementId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'view_ad') {
      // Check daily ad limit
      const today = new Date().toISOString().split('T')[0];
      const limitSetting = await db.setting.findUnique({ where: { key: 'daily_ad_limit' } });
      const dailyLimit = limitSetting ? parseInt(limitSetting.value) : 2;

      let adViewsToday = user.adViewsToday;
      if (user.lastAdViewDate !== today) {
        adViewsToday = 0;
        await db.user.update({
          where: { id: userId },
          data: { adViewsToday: 0, lastAdViewDate: today },
        });
      }

      if (adViewsToday >= dailyLimit) {
        return NextResponse.json({
          error: `Daily ad limit reached (${dailyLimit}/day)`,
          adViewsToday,
          dailyLimit,
        }, { status: 400 });
      }

      // Get ad reward
      const rewardSetting = await db.setting.findUnique({ where: { key: 'ad_reward' } });
      const adReward = rewardSetting ? parseFloat(rewardSetting.value) : 5;

      // Find an active ad placement
      const adPlacement = adPlacementId
        ? await db.adPlacement.findUnique({ where: { id: adPlacementId } })
        : await db.adPlacement.findFirst({ where: { isActive: true } });

      if (!adPlacement) {
        return NextResponse.json({ error: 'No ad available' }, { status: 404 });
      }

      // Record ad view
      await db.adView.create({
        data: {
          userId,
          adPlacementId: adPlacement.id,
          rewardGiven: true,
        },
      });

      // Update user
      await db.user.update({
        where: { id: userId },
        data: {
          nxrBalance: { increment: adReward },
          adViewsToday: { increment: 1 },
          lastAdViewDate: today,
        },
      });

      // Create notification
      await db.notification.create({
        data: {
          userId,
          title: 'Ad Reward Earned!',
          message: `You earned ${adReward} NXR for watching an ad!`,
          type: 'reward',
        },
      });

      return NextResponse.json({
        reward: adReward,
        adViewsToday: adViewsToday + 1,
        dailyLimit,
        message: 'Ad reward earned!',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Ad error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
