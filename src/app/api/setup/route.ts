import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '@/lib/db';

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
  try {
    const results: string[] = [];

    // Step 0: Push schema to database (create tables if they don't exist)
    try {
      const { stdout, stderr } = await execAsync('npx prisma db push --skip-generate', {
        timeout: 30000,
        env: { ...process.env },
      });
      results.push('Schema pushed to database');
      console.log('prisma db push stdout:', stdout);
      if (stderr) console.log('prisma db push stderr:', stderr);
    } catch (pushError: any) {
      console.error('Schema push error:', pushError.message);
      results.push('Schema push warning: ' + pushError.message.substring(0, 100));
      // Continue anyway - tables might already exist
    }

    // 1. Create roles
    const roles = [
      { name: 'Explorer', minReferrals: 0, miningBoost: 1.0, color: '#94A3B8', icon: '🧭' },
      { name: 'Builder', minReferrals: 5, miningBoost: 1.2, color: '#2563EB', icon: '🔨' },
      { name: 'Pioneer', minReferrals: 20, miningBoost: 1.5, color: '#7C3AED', icon: '⚡' },
      { name: 'Ambassador', minReferrals: 50, miningBoost: 2.0, color: '#F59E0B', icon: '👑' },
      { name: 'Legend', minReferrals: 100, miningBoost: 3.0, color: '#EF4444', icon: '🔥' },
    ];
    for (const role of roles) {
      await db.role.upsert({ where: { name: role.name }, update: {}, create: role });
    }
    results.push('Roles created/verified (5)');

    // 2. Create settings
    const settings = [
      { key: 'base_mining_reward', value: '50', description: 'Base NXR reward per mining session', category: 'mining' },
      { key: 'mining_duration_hours', value: '24', description: 'Mining session duration in hours', category: 'mining' },
      { key: 'referral_bonus', value: '25', description: 'NXR bonus for referral', category: 'referral' },
      { key: 'welcome_bonus', value: '100', description: 'NXR welcome bonus for new users', category: 'general' },
      { key: 'ad_reward', value: '5', description: 'NXR reward per ad view', category: 'ads' },
      { key: 'daily_ad_limit', value: '2', description: 'Max ad views per day', category: 'ads' },
      { key: 'streak_bonus', value: '5', description: 'Extra NXR per streak day', category: 'mining' },
      { key: 'app_name', value: 'Nexora Network', description: 'Application name', category: 'general' },
      { key: 'maintenance_mode', value: 'false', description: 'Enable maintenance mode', category: 'general' },
      { key: 'task_multiplier', value: '1', description: 'Global task reward multiplier', category: 'tasks' },
      { key: 'vault_multiplier', value: '1', description: 'Global vault reward multiplier', category: 'vault' },
    ];
    for (const setting of settings) {
      await db.setting.upsert({ where: { key: setting.key }, update: { value: setting.value }, create: setting });
    }
    results.push('Settings created/verified (11)');

    // 3. Create tasks
    const tasks = [
      { title: 'Follow on X', description: 'Follow Nexora on X (Twitter)', type: 'social', url: 'https://x.com/nexora', nxrReward: 20, vaultReward: 0.02, sortOrder: 1 },
      { title: 'Like Post on X', description: 'Like our latest post on X', type: 'social', url: 'https://x.com/nexora', nxrReward: 15, vaultReward: 0.01, sortOrder: 2 },
      { title: 'Repost on X', description: 'Repost our latest announcement', type: 'social', url: 'https://x.com/nexora', nxrReward: 20, vaultReward: 0.02, sortOrder: 3 },
      { title: 'Join Telegram', description: 'Join the Nexora Telegram community', type: 'social', url: 'https://t.me/nexora', nxrReward: 25, vaultReward: 0.03, sortOrder: 4 },
      { title: 'Join Discord', description: 'Join the Nexora Discord server', type: 'social', url: 'https://discord.gg/nexora', nxrReward: 25, vaultReward: 0.03, sortOrder: 5 },
      { title: 'Visit Website', description: 'Visit the Nexora official website', type: 'social', url: 'https://nexora.network', nxrReward: 10, vaultReward: 0.01, sortOrder: 6 },
    ];
    for (const task of tasks) {
      const existing = await db.task.findFirst({ where: { title: task.title } });
      if (!existing) { await db.task.create({ data: task }); }
    }
    results.push('Tasks created/verified (6)');

    // 4. Create ads
    const ads = [
      { position: 'home_banner', adType: 'banner', title: 'Welcome to Nexora', htmlCode: '<div style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:16px;border-radius:12px;text-align:center;color:white;font-weight:bold;">🚀 Start Mining &amp; Earn NXR Rewards!</div>', isActive: true },
      { position: 'earn_banner', adType: 'banner', title: 'Complete Tasks', htmlCode: '<div style="background:linear-gradient(135deg,#F59E0B,#EF4444);padding:16px;border-radius:12px;text-align:center;color:white;font-weight:bold;">💰 Complete tasks to earn more NXR!</div>', isActive: true },
    ];
    for (const ad of ads) {
      const existing = await db.adPlacement.findFirst({ where: { position: ad.position } });
      if (!existing) { await db.adPlacement.create({ data: ad }); }
    }
    results.push('Ads created/verified (2)');

    // 5. Create announcements
    const announcements = [
      { title: 'Welcome to Nexora Network!', message: 'Start mining NXR tokens today. Complete tasks, refer friends, and earn rewards!', isImportant: true, isActive: true },
      { title: 'Mining is Live!', message: 'Your 24-hour mining cycle is ready. Tap Start Mining to begin earning NXR!', isImportant: false, isActive: true },
      { title: 'Refer & Earn', message: 'Share your referral code with friends and earn bonus NXR for each referral!', isImportant: false, isActive: true },
    ];
    for (const ann of announcements) {
      const existing = await db.announcement.findFirst({ where: { title: ann.title } });
      if (!existing) { await db.announcement.create({ data: ann }); }
    }
    results.push('Announcements created/verified (3)');

    // 6. Create/verify admin user (smstudiobd25@gmail.com)
    const ambassadorRole = await db.role.findUnique({ where: { name: 'Ambassador' } });
    const adminEmail = 'smstudiobd25@gmail.com';
    const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });

    if (existingAdmin) {
      // Ensure admin flag is set
      if (!existingAdmin.isAdmin) {
        await db.user.update({
          where: { id: existingAdmin.id },
          data: { isAdmin: true, roleId: ambassadorRole?.id || existingAdmin.roleId },
        });
      }
      results.push('Admin user verified (smstudiobd25@gmail.com)');
    } else {
      // Create admin user
      const adminCode = 'NEXORA-ADMIN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await db.user.create({
        data: {
          email: adminEmail,
          name: 'Admin',
          password: 'admin123',
          isAdmin: true,
          roleId: ambassadorRole?.id || 'ambassador',
          referralCode: adminCode,
          nxrBalance: 10000,
          vaultBalance: 50,
          miningDays: 30,
          tasksCompleted: 6,
          streak: 7,
          bestStreak: 14,
        },
      });
      results.push('Admin user created (smstudiobd25@gmail.com / admin123)');
    }

    // 7. Also ensure admin@nexora.com admin exists
    const existingAdmin2 = await db.user.findUnique({ where: { email: 'admin@nexora.com' } });
    if (!existingAdmin2) {
      const admin2Code = 'NEXORA-SYS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await db.user.create({
        data: {
          email: 'admin@nexora.com',
          name: 'System Admin',
          password: 'admin123',
          isAdmin: true,
          roleId: ambassadorRole?.id || 'ambassador',
          referralCode: admin2Code,
          nxrBalance: 5000,
          vaultBalance: 25,
          miningDays: 15,
          tasksCompleted: 3,
          streak: 5,
          bestStreak: 10,
        },
      });
      results.push('System admin created (admin@nexora.com / admin123)');
    } else {
      results.push('System admin verified (admin@nexora.com)');
    }

    const counts = {
      roles: await db.role.count(),
      settings: await db.setting.count(),
      tasks: await db.task.count(),
      ads: await db.adPlacement.count(),
      announcements: await db.announcement.count(),
      users: await db.user.count(),
    };

    return NextResponse.json({ success: true, message: 'Database setup complete!', results, counts });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Setup failed',
      hint: 'Make sure DATABASE_URL is set in your Vercel environment variables. Use Neon, Supabase, or any PostgreSQL provider. Format: postgresql://user:password@host:5432/dbname?sslmode=require'
    }, { status: 500 });
  }
}
