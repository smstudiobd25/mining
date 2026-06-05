import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get('position') || 'home_banner';

    const ads = await db.adPlacement.findMany({
      where: { position, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Ads GET error:', error);
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
    const { action, adPlacementId } = body;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.isBanned) {
      return NextResponse.json({ error: 'User not found or banned' }, { status: 403 });
    }

    // Get ad settings
    const adRewardSetting = await db.setting.findUnique({ where: { key: 'ad_reward' } });
    const dailyLimitSetting = await db.setting.findUnique({ where: { key: 'daily_ad_limit' } });
    const adReward = adRewardSetting ? parseFloat(adRewardSetting.value) : 5;
    const dailyLimit = dailyLimitSetting ? parseInt(dailyLimitSetting.value) : 2;

    // Reset daily ad views if new day
    const today = new Date().toISOString().split('T')[0];
    if (user.lastAdViewDate !== today) {
      await db.user.update({
        where: { id: userId },
        data: { adViewsToday: 0, lastAdViewDate: today },
      });
      user.adViewsToday = 0;
    }

    if (action === 'watch_earn') {
      // Check daily limit
      if (user.adViewsToday >= dailyLimit) {
        return NextResponse.json({ error: `Daily ad limit reached (${dailyLimit}/${dailyLimit})` }, { status: 400 });
      }

      // Find an active ad to watch
      const ad = await db.adPlacement.findFirst({
        where: { isActive: true, position: 'earn_banner' },
      });

      if (!ad) {
        // Create a default ad view experience
        // Award the user anyway for watching
        await db.user.update({
          where: { id: userId },
          data: {
            nxrBalance: { increment: adReward },
            adViewsToday: { increment: 1 },
          },
        });

        await db.notification.create({
          data: {
            userId,
            title: 'Ad Reward! 🎬',
            message: `You earned ${adReward} NXR for watching an ad!`,
            type: 'ad',
          },
        });

        return NextResponse.json({
          success: true,
          reward: adReward,
          viewsRemaining: dailyLimit - user.adViewsToday - 1,
          message: `Earned ${adReward} NXR!`,
        });
      }

      // Track ad view
      await db.adView.create({
        data: {
          userId,
          adPlacementId: ad.id,
          rewardGiven: true,
        },
      });

      await db.user.update({
        where: { id: userId },
        data: {
          nxrBalance: { increment: adReward },
          adViewsToday: { increment: 1 },
        },
      });

      return NextResponse.json({
        success: true,
        reward: adReward,
        viewsRemaining: dailyLimit - user.adViewsToday - 1,
        ad: {
          id: ad.id,
          title: ad.title,
          htmlCode: ad.htmlCode,
          imageUrl: ad.imageUrl,
          linkUrl: ad.linkUrl,
        },
        message: `Earned ${adReward} NXR!`,
      });
    }

    if (action === 'view') {
      // Track ad impression
      if (adPlacementId) {
        await db.adView.create({
          data: {
            userId,
            adPlacementId,
            rewardGiven: false,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Ads POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
