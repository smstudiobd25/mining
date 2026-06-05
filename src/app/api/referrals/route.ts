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
        referralsMade: {
          include: {
            referred: {
              select: { id: true, name: true, email: true, createdAt: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const referralCount = user.referralsMade.length;
    const referralCode = user.referralCode;

    // Get referral bonus
    const referralBonusSetting = await db.setting.findUnique({ where: { key: 'referral_bonus' } });
    const referralBonus = referralBonusSetting ? parseFloat(referralBonusSetting.value) : 25;

    // Get all roles for progress display
    const roles = await db.role.findMany({ orderBy: { minReferrals: 'asc' } });

    // Find next role
    let nextRole = null;
    let currentRoleIndex = roles.findIndex(r => r.id === user.roleId);
    if (currentRoleIndex < roles.length - 1) {
      nextRole = roles[currentRoleIndex + 1];
    }

    return NextResponse.json({
      referralCode,
      referralCount,
      referralBonus,
      currentRole: user.role,
      nextRole,
      referrals: user.referralsMade.map(r => ({
        id: r.id,
        name: r.referred.name,
        email: r.referred.email,
        date: r.createdAt,
        bonusGiven: r.bonusGiven,
      })),
    });
  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
