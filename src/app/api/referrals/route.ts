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
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referral count
    const referralCount = await db.referral.count({
      where: { referrerId: userId },
    });

    // Get referred users
    const referrals = await db.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all roles to determine next role
    const roles = await db.role.findMany({
      orderBy: { minReferrals: 'asc' },
    });

    const currentRole = user.role;
    let nextRole = null;
    for (const role of roles) {
      if (role.minReferrals > referralCount) {
        nextRole = role;
        break;
      }
    }

    // Referral bonus setting
    const referralBonusSetting = await db.setting.findUnique({ where: { key: 'referral_bonus' } });
    const referralBonus = referralBonusSetting ? parseFloat(referralBonusSetting.value) : 25;

    return NextResponse.json({
      referralCode: user.referralCode,
      referralCount,
      referralBonus,
      currentRole,
      nextRole,
      referralsNeeded: nextRole ? nextRole.minReferrals - referralCount : 0,
      referredUsers: referrals.map((r) => ({
        name: r.referred.name,
        date: r.createdAt,
      })),
      roles,
    });
  } catch (error) {
    console.error('Referrals GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
