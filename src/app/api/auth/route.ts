import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
        return NextResponse.json({ error: 'Account is banned' }, { status: 403 });
      }

      return NextResponse.json({
        user: {
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
          adViewsToday: user.adViewsToday,
          lastAdViewDate: user.lastAdViewDate,
        },
      });
    }

    if (action === 'signup') {
      const { email, password, name, referralCode } = body;
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      // Get welcome bonus setting
      const welcomeBonusSetting = await db.setting.findUnique({ where: { key: 'welcome_bonus' } });
      const welcomeBonus = welcomeBonusSetting ? parseFloat(welcomeBonusSetting.value) : 100;

      // Get referral bonus setting
      const referralBonusSetting = await db.setting.findUnique({ where: { key: 'referral_bonus' } });
      const referralBonus = referralBonusSetting ? parseFloat(referralBonusSetting.value) : 25;

      // Get explorer role
      const explorerRole = await db.role.findUnique({ where: { name: 'Explorer' } });

      // Generate unique referral code
      const code = 'NEXORA-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      let referredBy = null;
      let referrerUser = null;

      // Check referral code
      if (referralCode) {
        referrerUser = await db.user.findUnique({ where: { referralCode } });
        if (referrerUser) {
          referredBy = referrerUser.id;
        }
      }

      const user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || 'User',
          password,
          referralCode: code,
          referredBy,
          roleId: explorerRole?.id || 'explorer',
          nxrBalance: welcomeBonus,
        },
        include: { role: true },
      });

      // Create referral record and bonus
      if (referrerUser) {
        await db.referral.create({
          data: {
            referrerId: referrerUser.id,
            referredId: user.id,
            bonusGiven: true,
          },
        });

        // Give referrer bonus
        await db.user.update({
          where: { id: referrerUser.id },
          data: { nxrBalance: { increment: referralBonus } },
        });

        // Notify referrer
        await db.notification.create({
          data: {
            userId: referrerUser.id,
            title: 'New Referral!',
            message: `${user.name} joined using your referral code! You earned ${referralBonus} NXR.`,
            type: 'referral',
          },
        });

        // Check if referrer should be promoted
        const referrerRefCount = await db.referral.count({ where: { referrerId: referrerUser.id } });
        const roles = await db.role.findMany({ orderBy: { minReferrals: 'asc' } });
        for (const role of roles) {
          if (referrerRefCount >= role.minReferrals) {
            await db.user.update({
              where: { id: referrerUser.id },
              data: { roleId: role.id },
            });
          }
        }
      }

      // Welcome notification
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Nexora! 🎉',
          message: `You've received ${welcomeBonus} NXR as a welcome bonus. Start mining to earn more!`,
          type: 'system',
        },
      });

      return NextResponse.json({
        user: {
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
          adViewsToday: user.adViewsToday,
          lastAdViewDate: user.lastAdViewDate,
        },
      });
    }

    if (action === 'guest') {
      const explorerRole = await db.role.findUnique({ where: { name: 'Explorer' } });
      const welcomeBonusSetting = await db.setting.findUnique({ where: { key: 'welcome_bonus' } });
      const welcomeBonus = welcomeBonusSetting ? parseFloat(welcomeBonusSetting.value) : 100;

      const guestNum = Math.floor(Math.random() * 99999);
      const code = 'NEXORA-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const user = await db.user.create({
        data: {
          email: `guest-${guestNum}@nexora.guest`,
          name: `Guest ${guestNum}`,
          roleId: explorerRole?.id || 'explorer',
          referralCode: code,
          nxrBalance: welcomeBonus,
        },
        include: { role: true },
      });

      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Nexora! 🎉',
          message: `You've received ${welcomeBonus} NXR as a welcome bonus. Start mining to earn more!`,
          type: 'system',
        },
      });

      return NextResponse.json({
        user: {
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
          adViewsToday: user.adViewsToday,
          lastAdViewDate: user.lastAdViewDate,
        },
      });
    }

    if (action === 'forgot') {
      return NextResponse.json({ message: 'If an account with that email exists, a reset link will be sent.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
