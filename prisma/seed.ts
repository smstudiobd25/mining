import { db } from '../src/lib/db';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create default roles
  await Promise.all([
    db.role.upsert({ where: { name: 'Explorer' }, update: {}, create: { name: 'Explorer', minReferrals: 0, miningBoost: 1.0, color: '#94A3B8', icon: '🧭' } }),
    db.role.upsert({ where: { name: 'Builder' }, update: {}, create: { name: 'Builder', minReferrals: 5, miningBoost: 1.2, color: '#2563EB', icon: '🔨' } }),
    db.role.upsert({ where: { name: 'Pioneer' }, update: {}, create: { name: 'Pioneer', minReferrals: 20, miningBoost: 1.5, color: '#7C3AED', icon: '⚡' } }),
    db.role.upsert({ where: { name: 'Ambassador' }, update: {}, create: { name: 'Ambassador', minReferrals: 50, miningBoost: 2.0, color: '#F59E0B', icon: '👑' } }),
    db.role.upsert({ where: { name: 'Legend' }, update: {}, create: { name: 'Legend', minReferrals: 100, miningBoost: 3.0, color: '#EF4444', icon: '🔥' } }),
  ]);

  // Create default settings
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
    await db.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Create default tasks
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
    if (!existing) {
      await db.task.create({ data: task });
    }
  }

  // Create default ad placements
  const ads = [
    { position: 'home_banner', adType: 'banner', title: 'Welcome to Nexora', htmlCode: '<div style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:16px;border-radius:12px;text-align:center;color:white;font-weight:bold;">🚀 Start Mining &amp; Earn NXR Rewards!</div>', isActive: true },
    { position: 'earn_banner', adType: 'banner', title: 'Complete Tasks', htmlCode: '<div style="background:linear-gradient(135deg,#F59E0B,#EF4444);padding:16px;border-radius:12px;text-align:center;color:white;font-weight:bold;">💰 Complete tasks to earn more NXR!</div>', isActive: true },
  ];

  for (const ad of ads) {
    const existing = await db.adPlacement.findFirst({ where: { position: ad.position } });
    if (!existing) {
      await db.adPlacement.create({ data: ad });
    }
  }

  // Create default announcements
  const announcements = [
    { title: 'Welcome to Nexora Network!', message: 'Start mining NXR tokens today. Complete tasks, refer friends, and earn rewards!', isImportant: true, isActive: true },
    { title: 'Mining is Live!', message: 'Your 24-hour mining cycle is ready. Tap Start Mining to begin earning NXR!', isImportant: false, isActive: true },
    { title: 'Refer & Earn', message: 'Share your referral code with friends and earn bonus NXR for each referral!', isImportant: false, isActive: true },
  ];

  for (const ann of announcements) {
    const existing = await db.announcement.findFirst({ where: { title: ann.title } });
    if (!existing) {
      await db.announcement.create({ data: ann });
    }
  }

  // Get Ambassador role for admin
  const ambassadorRole = await db.role.findUnique({ where: { name: 'Ambassador' } });
  const explorerRole = await db.role.findUnique({ where: { name: 'Explorer' } });

  // Create admin user
  const adminExists = await db.user.findUnique({ where: { email: 'admin@nexora.com' } });
  if (!adminExists) {
    await db.user.create({
      data: {
        email: 'admin@nexora.com',
        name: 'Admin',
        password: 'admin123',
        isAdmin: true,
        roleId: ambassadorRole?.id || 'ambassador',
        referralCode: 'NEXORA-ADMIN',
        nxrBalance: 10000,
        vaultBalance: 50,
        miningDays: 30,
        tasksCompleted: 6,
        streak: 7,
        bestStreak: 14,
      },
    });
  }

  // Create demo user
  const userExists = await db.user.findUnique({ where: { email: 'user@nexora.com' } });
  if (!userExists) {
    await db.user.create({
      data: {
        email: 'user@nexora.com',
        name: 'Demo User',
        password: 'user123',
        isAdmin: false,
        roleId: explorerRole?.id || 'explorer',
        referralCode: 'NEXORA-DEMO',
        nxrBalance: 250,
        vaultBalance: 2.5,
        miningDays: 5,
        tasksCompleted: 2,
        streak: 3,
        bestStreak: 5,
      },
    });
  }

  console.log('✅ Seed completed!');
}

seed().catch(console.error);
