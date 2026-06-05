import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding database...');

  // Create default settings
  const settings = [
    { key: 'base_mining_reward', value: '50', description: 'Base NXR reward per mining session' },
    { key: 'mining_duration_hours', value: '24', description: 'Mining session duration in hours' },
    { key: 'referral_bonus', value: '25', description: 'NXR bonus for successful referral' },
    { key: 'welcome_bonus', value: '100', description: 'NXR bonus for new user signup' },
    { key: 'ad_reward', value: '5', description: 'NXR reward per ad view' },
    { key: 'daily_ad_limit', value: '2', description: 'Maximum ad views per day' },
    { key: 'task_multiplier', value: '1', description: 'Multiplier for task NXR rewards' },
    { key: 'vault_multiplier', value: '1', description: 'Multiplier for vault rewards' },
  ];

  for (const setting of settings) {
    await db.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Settings seeded');

  // Create default roles
  const roles = [
    { id: 'role-explorer', name: 'Explorer', minReferrals: 0, miningBoost: 1.0, color: '#94A3B8' },
    { id: 'role-builder', name: 'Builder', minReferrals: 5, miningBoost: 1.2, color: '#3B82F6' },
    { id: 'role-pioneer', name: 'Pioneer', minReferrals: 20, miningBoost: 1.5, color: '#8B5CF6' },
    { id: 'role-ambassador', name: 'Ambassador', minReferrals: 50, miningBoost: 2.0, color: '#F59E0B' },
    { id: 'role-legend', name: 'Legend', minReferrals: 100, miningBoost: 3.0, color: '#EF4444' },
  ];

  for (const role of roles) {
    await db.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }
  console.log('✅ Roles seeded');

  // Create default tasks
  const tasks = [
    { title: 'Follow on X', description: 'Follow Nexora on X (Twitter) for the latest updates', type: 'social', url: 'https://x.com/nexora', nxrReward: 20, vaultReward: 0.02 },
    { title: 'Join Telegram', description: 'Join the Nexora Telegram community', type: 'social', url: 'https://t.me/nexora', nxrReward: 20, vaultReward: 0.02 },
    { title: 'Join Discord', description: 'Join the Nexora Discord server', type: 'social', url: 'https://discord.gg/nexora', nxrReward: 20, vaultReward: 0.02 },
    { title: 'Visit Website', description: 'Visit the official Nexora website', type: 'social', url: 'https://nexora.io', nxrReward: 20, vaultReward: 0.02 },
    { title: 'Like Post', description: 'Like our latest post on X', type: 'social', url: 'https://x.com/nexora', nxrReward: 20, vaultReward: 0.02 },
    { title: 'Repost Post', description: 'Repost our latest post on X', type: 'social', url: 'https://x.com/nexora', nxrReward: 20, vaultReward: 0.02 },
  ];

  for (const task of tasks) {
    const existing = await db.task.findFirst({ where: { title: task.title } });
    if (!existing) {
      await db.task.create({ data: task });
    }
  }
  console.log('✅ Tasks seeded');

  // Create default ad placements
  const ads = [
    { position: 'home_banner', adType: 'banner', title: 'Welcome to Nexora', imageUrl: '', linkUrl: 'https://nexora.io', htmlCode: '' },
    { position: 'earn_banner', adType: 'banner', title: 'Earn More NXR', imageUrl: '', linkUrl: 'https://nexora.io', htmlCode: '' },
  ];

  for (const ad of ads) {
    const existing = await db.adPlacement.findFirst({ where: { position: ad.position } });
    if (!existing) {
      await db.adPlacement.create({ data: ad });
    }
  }
  console.log('✅ Ad placements seeded');

  // Create default reward vault campaign
  const existingCampaign = await db.rewardVaultCampaign.findFirst();
  if (!existingCampaign) {
    await db.rewardVaultCampaign.create({
      data: {
        title: 'Genesis Vault Campaign',
        description: 'The first Nexora Reward Vault campaign. Earn vault rewards by completing tasks and mining!',
        totalPool: 10000,
        isActive: true,
      },
    });
  }
  console.log('✅ Vault campaign seeded');

  // Create default announcements
  const announcements = [
    { title: 'Welcome to Nexora Network!', message: 'Start mining NXR today and earn rewards. Complete social tasks, invite friends, and grow your balance!', isImportant: true, isActive: true },
    { title: 'Mining is Live!', message: 'The Nexora mining system is now active. Tap Start Mining to begin earning NXR every 24 hours!', isImportant: false, isActive: true },
    { title: 'Refer & Earn', message: 'Share your referral code with friends and earn 25 NXR for each successful referral. Level up your role for better mining boosts!', isImportant: false, isActive: true },
  ];

  for (const ann of announcements) {
    const existing = await db.announcement.findFirst({ where: { title: ann.title } });
    if (!existing) {
      await db.announcement.create({ data: ann });
    }
  }
  console.log('✅ Announcements seeded');

  // Create admin user
  const adminReferralCode = 'NEXORA-ADMIN';
  const existingAdmin = await db.user.findUnique({ where: { email: 'admin@nexora.com' } });
  if (!existingAdmin) {
    await db.user.create({
      data: {
        email: 'admin@nexora.com',
        name: 'Admin',
        password: 'admin123',
        referralCode: adminReferralCode,
        isAdmin: true,
        roleId: 'role-ambassador',
        nxrBalance: 10000,
        vaultBalance: 50,
        miningDays: 30,
        tasksCompleted: 6,
        streak: 7,
      },
    });
  }
  console.log('✅ Admin user seeded');

  // Create demo user
  const userReferralCode = 'NEXORA-USER1';
  const existingUser = await db.user.findUnique({ where: { email: 'user@nexora.com' } });
  if (!existingUser) {
    await db.user.create({
      data: {
        email: 'user@nexora.com',
        name: 'Demo User',
        password: 'user123',
        referralCode: userReferralCode,
        isAdmin: false,
        roleId: 'role-explorer',
        nxrBalance: 250,
        vaultBalance: 1.5,
        miningDays: 5,
        tasksCompleted: 3,
        streak: 2,
      },
    });
  }
  console.log('✅ Demo user seeded');

  // Create notifications for demo user
  if (!existingUser) {
    const demoUser = await db.user.findUnique({ where: { email: 'user@nexora.com' } });
    if (demoUser) {
      await db.notification.createMany({
        data: [
          { userId: demoUser.id, title: 'Welcome Bonus!', message: 'You received 100 NXR as a welcome bonus!', type: 'reward' },
          { userId: demoUser.id, title: 'Mining Ready', message: 'Your mining session is ready to start. Tap Start Mining to begin!', type: 'system' },
          { userId: demoUser.id, title: 'Complete Tasks', message: 'Complete social tasks to earn more NXR and vault rewards!', type: 'system' },
        ],
      });
    }
  }
  console.log('✅ Notifications seeded');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
