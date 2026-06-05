import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function verifyAdmin(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.isAdmin) {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const userId = searchParams.get('userId');

    if (!userId || !(await verifyAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (section === 'users') {
      const search = searchParams.get('search') || '';
      const users = await db.user.findMany({
        where: search ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        } : undefined,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      const safeUsers = users.map(({ password, ...rest }) => rest);
      return NextResponse.json({ users: safeUsers });
    }

    if (section === 'tasks') {
      const tasks = await db.task.findMany({
        include: { _count: { select: { completions: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ tasks });
    }

    if (section === 'announcements') {
      const announcements = await db.announcement.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ announcements });
    }

    if (section === 'vault_campaigns') {
      const campaigns = await db.rewardVaultCampaign.findMany({
        include: { _count: { select: { vaultRewards: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ campaigns });
    }

    if (section === 'roles') {
      const roles = await db.role.findMany({
        include: { _count: { select: { users: true } } },
        orderBy: { minReferrals: 'asc' },
      });
      return NextResponse.json({ roles });
    }

    if (section === 'settings') {
      const settings = await db.setting.findMany({ orderBy: { key: 'asc' } });
      return NextResponse.json({ settings });
    }

    if (section === 'ads') {
      const ads = await db.adPlacement.findMany({
        include: { _count: { select: { adViews: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ ads });
    }

    if (section === 'stats') {
      const totalUsers = await db.user.count();
      const activeMiners = await db.miningSession.count({ where: { claimed: false, endsAt: { gt: new Date() } } });
      const totalNxR = await db.user.aggregate({ _sum: { nxrBalance: true } });
      const totalTasks = await db.taskCompletion.count();
      const totalReferrals = await db.referral.count();

      return NextResponse.json({
        stats: {
          totalUsers,
          activeMiners,
          totalNxR: totalNxR._sum.nxrBalance || 0,
          totalTasks,
          totalReferrals,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, adminId } = body;

    if (!adminId || !(await verifyAdmin(adminId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'ban_user') {
      const { targetUserId, ban } = body;
      await db.user.update({
        where: { id: targetUserId },
        data: { isBanned: ban },
      });
      await db.adminLog.create({
        data: { adminId, action: ban ? 'ban_user' : 'unban_user', details: targetUserId },
      });
      return NextResponse.json({ message: ban ? 'User banned' : 'User unbanned' });
    }

    if (action === 'create_task') {
      const { title, description, type, url, nxrReward, vaultReward } = body;
      const task = await db.task.create({
        data: { title, description, type, url, nxrReward, vaultReward },
      });
      await db.adminLog.create({
        data: { adminId, action: 'create_task', details: task.id },
      });
      return NextResponse.json({ task, message: 'Task created' });
    }

    if (action === 'update_task') {
      const { taskId, ...updates } = body;
      const task = await db.task.update({
        where: { id: taskId },
        data: updates,
      });
      return NextResponse.json({ task, message: 'Task updated' });
    }

    if (action === 'delete_task') {
      const { taskId } = body;
      await db.taskCompletion.deleteMany({ where: { taskId } });
      await db.task.delete({ where: { id: taskId } });
      await db.adminLog.create({
        data: { adminId, action: 'delete_task', details: taskId },
      });
      return NextResponse.json({ message: 'Task deleted' });
    }

    if (action === 'create_announcement') {
      const { title, message, isImportant } = body;
      const announcement = await db.announcement.create({
        data: { title, message, isImportant },
      });
      // Send notification to all users
      const users = await db.user.findMany({ where: { isBanned: false }, select: { id: true } });
      if (users.length > 0) {
        await db.notification.createMany({
          data: users.map(u => ({
            userId: u.id,
            title: `📢 ${title}`,
            message,
            type: 'announcement',
          })),
        });
      }
      await db.adminLog.create({
        data: { adminId, action: 'create_announcement', details: announcement.id },
      });
      return NextResponse.json({ announcement, message: 'Announcement created' });
    }

    if (action === 'update_announcement') {
      const { announcementId, ...updates } = body;
      const announcement = await db.announcement.update({
        where: { id: announcementId },
        data: updates,
      });
      return NextResponse.json({ announcement, message: 'Announcement updated' });
    }

    if (action === 'delete_announcement') {
      const { announcementId } = body;
      await db.announcement.delete({ where: { id: announcementId } });
      return NextResponse.json({ message: 'Announcement deleted' });
    }

    if (action === 'create_vault_campaign') {
      const { title, description, totalPool } = body;
      const campaign = await db.rewardVaultCampaign.create({
        data: { title, description, totalPool },
      });
      return NextResponse.json({ campaign, message: 'Vault campaign created' });
    }

    if (action === 'update_vault_campaign') {
      const { campaignId, ...updates } = body;
      const campaign = await db.rewardVaultCampaign.update({
        where: { id: campaignId },
        data: updates,
      });
      return NextResponse.json({ campaign, message: 'Vault campaign updated' });
    }

    if (action === 'create_role') {
      const { name, minReferrals, miningBoost, color } = body;
      const role = await db.role.create({
        data: { name, minReferrals, miningBoost, color },
      });
      return NextResponse.json({ role, message: 'Role created' });
    }

    if (action === 'update_role') {
      const { roleId, ...updates } = body;
      const role = await db.role.update({
        where: { id: roleId },
        data: updates,
      });
      return NextResponse.json({ role, message: 'Role updated' });
    }

    if (action === 'delete_role') {
      const { roleId } = body;
      // Don't delete if users have this role
      const userCount = await db.user.count({ where: { roleId } });
      if (userCount > 0) {
        return NextResponse.json({ error: 'Cannot delete role with assigned users' }, { status: 400 });
      }
      await db.role.delete({ where: { id: roleId } });
      return NextResponse.json({ message: 'Role deleted' });
    }

    if (action === 'update_settings') {
      const { settings } = body; // Array of { key, value }
      for (const setting of settings) {
        await db.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value, description: setting.description || '' },
        });
      }
      await db.adminLog.create({
        data: { adminId, action: 'update_settings', details: JSON.stringify(settings) },
      });
      return NextResponse.json({ message: 'Settings updated' });
    }

    if (action === 'create_ad') {
      const { position, adType, title, imageUrl, linkUrl, htmlCode } = body;
      const ad = await db.adPlacement.create({
        data: { position, adType, title, imageUrl, linkUrl, htmlCode },
      });
      return NextResponse.json({ ad, message: 'Ad placement created' });
    }

    if (action === 'update_ad') {
      const { adId, ...updates } = body;
      const ad = await db.adPlacement.update({
        where: { id: adId },
        data: updates,
      });
      return NextResponse.json({ ad, message: 'Ad placement updated' });
    }

    if (action === 'delete_ad') {
      const { adId } = body;
      await db.adView.deleteMany({ where: { adPlacementId: adId } });
      await db.adPlacement.delete({ where: { id: adId } });
      return NextResponse.json({ message: 'Ad placement deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
