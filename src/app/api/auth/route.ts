import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'NEXORA-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = await db.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { role: true },
      });

      if (!user || user.password !== password) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (user.isBanned) {
        return NextResponse.json({ error: 'Account has been banned' }, { status: 403 });
      }

      const { password: _, ...safeUser } = user;
      return NextResponse.json({ user: safeUser, message: 'Login successful' });
    }

    if (action === 'signup') {
      const { email, password, name, referralCode } = body;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      let referrerId: string | null = null;
      if (referralCode) {
        const referrer = await db.user.findUnique({
          where: { referralCode },
        });
        if (referrer) {
          referrerId = referrer.id;
        }
      }

      // Get welcome bonus setting
      const welcomeBonusSetting = await db.setting.findUnique({ where: { key: 'welcome_bonus' } });
      const welcomeBonus = welcomeBonusSetting ? parseFloat(welcomeBonusSetting.value) : 100;

      // Get referral bonus setting
      const referralBonusSetting = await db.setting.findUnique({ where: { key: 'referral_bonus' } });
      const referralBonus = referralBonusSetting ? parseFloat(referralBonusSetting.value) : 25;

      const user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || 'User',
          password,
          referralCode: generateReferralCode(),
          referredBy: referrerId ? (await db.user.findUnique({ where: { id: referrerId } }))?.referralCode || null : null,
          nxrBalance: welcomeBonus,
          roleId: 'role-explorer',
        },
        include: { role: true },
      });

      // Give referral bonus
      if (referrerId) {
        await db.user.update({
          where: { id: referrerId },
          data: { nxrBalance: { increment: referralBonus } },
        });

        await db.referral.create({
          data: {
            referrerId,
            referredId: user.id,
            bonusGiven: true,
          },
        });

        // Create notification for referrer
        await db.notification.create({
          data: {
            userId: referrerId,
            title: 'New Referral!',
            message: `Someone joined using your referral code! You earned ${referralBonus} NXR.`,
            type: 'referral',
          },
        });

        // Update referrer's role based on referral count
        const referrerRefCount = await db.referral.count({ where: { referrerId } });
        const roles = await db.role.findMany({ orderBy: { minReferrals: 'desc' } });
        for (const role of roles) {
          if (referrerRefCount >= role.minReferrals) {
            await db.user.update({
              where: { id: referrerId },
              data: { roleId: role.id },
            });
            break;
          }
        }
      }

      // Create welcome notification
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome Bonus!',
          message: `You received ${welcomeBonus} NXR as a welcome bonus! Start mining to earn more.`,
          type: 'reward',
        },
      });

      const { password: _, ...safeUser } = user;
      return NextResponse.json({ user: safeUser, message: 'Account created successfully' });
    }

    if (action === 'guest') {
      const guestCode = generateReferralCode();
      const welcomeBonusSetting = await db.setting.findUnique({ where: { key: 'welcome_bonus' } });
      const welcomeBonus = welcomeBonusSetting ? parseFloat(welcomeBonusSetting.value) : 100;

      const user = await db.user.create({
        data: {
          email: `guest_${Date.now()}@nexora.io`,
          name: 'Guest',
          password: 'guest',
          referralCode: guestCode,
          nxrBalance: welcomeBonus,
          roleId: 'role-explorer',
        },
        include: { role: true },
      });

      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Nexora!',
          message: `You received ${welcomeBonus} NXR as a welcome bonus! Start mining to earn more.`,
          type: 'reward',
        },
      });

      const { password: _, ...safeUser } = user;
      return NextResponse.json({ user: safeUser, message: 'Guest account created' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
