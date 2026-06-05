import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function checkAdmin(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  return user?.isAdmin === true;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId || !(await checkAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');

    if (section === 'dashboard') {
      const totalUsers = await db.user.count();
      const activeMiners = await db.miningSession.count({
        where: { claimed: false, endsAt: { gt: new Date() } },
      });
      const totalNxr = await db.user.aggregate({ _sum: { nxrBalance: true } });
      const totalTasksCompleted = await db.taskCompletion.count();
      const bannedUsers = await db.user.count({ where: { isBanned: true } });
      const totalReferrals = await db.referral.count();

      return NextResponse.json({
        totalUsers,
        activeMiners,
        totalNxr: totalNxr._sum.nxrBalance || 0,
        totalTasksCompleted,
        bannedUsers,
        totalReferrals,
      });
    }

    if (section === 'users') {
      const users = await db.user.findMany({
        include: { role: true, _count: { select: { referralsMade: true, taskCompletions: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return NextResponse.json({ users });
    }

    if (section === 'tasks') {
      const tasks = await db.task.findMany({
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { completions: true } } },
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
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { vaultRewards: true } } },
      });
      return NextResponse.json({ campaigns });
    }

    if (section === 'roles') {
      const roles = await db.role.findMany({
        orderBy: { minReferrals: 'asc' },
        include: { _count: { select: { users: true } } },
      });
      return NextResponse.json({ roles });
    }

    if (section === 'settings') {
      const settings = await db.setting.findMany({
        orderBy: { key: 'asc' },
      });
      return NextResponse.json({ settings });
    }

    if (section === 'ads') {
      const ads = await db.adPlacement.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { adViews: true } } },
      });
      return NextResponse.json({ ads });
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId || !(await checkAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { section, action, data } = body;

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: userId,
        action: `${section}:${action}`,
        details: JSON.stringify(data).substring(0, 500),
      },
    });

    if (section === 'users') {
      if (action === 'ban') {
        await db.user.update({ where: { id: data.id }, data: { isBanned: true } });
        return NextResponse.json({ success: true });
      }
      if (action === 'unban') {
        await db.user.update({ where: { id: data.id }, data: { isBanned: false } });
        return NextResponse.json({ success: true });
      }
      if (action === 'update') {
        const updateData: Record<string, unknown> = {};
        if (data.name) updateData.name = data.name;
        if (data.nxrBalance !== undefined) updateData.nxrBalance = data.nxrBalance;
        if (data.vaultBalance !== undefined) updateData.vaultBalance = data.vaultBalance;
        if (data.roleId) updateData.roleId = data.roleId;
        if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin;
        await db.user.update({ where: { id: data.id }, data: updateData });
        return NextResponse.json({ success: true });
      }
      if (action === 'changePassword') {
        if (!data.id || !data.newPassword || data.newPassword.length < 6) {
          return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }
        await db.user.update({ where: { id: data.id }, data: { password: data.newPassword } });
        return NextResponse.json({ success: true });
      }
    }

    if (section === 'tasks') {
      if (action === 'create') {
        const task = await db.task.create({ data });
        // Send notifications to all users about the new task
        if (data.notifyUsers !== false) {
          const users = await db.user.findMany({ where: { isBanned: false }, select: { id: true } });
          await db.notification.createMany({
            data: users.map((u) => ({
              userId: u.id,
              title: `New Task: ${task.title} 🎯`,
              message: `A new task is available! Earn ${task.nxrReward} NXR + $${task.vaultReward} Vault reward.`,
              type: 'task',
            })),
          });
        }
        return NextResponse.json({ task });
      }
      if (action === 'update') {
        const { id, ...updateData } = data;
        const task = await db.task.update({ where: { id }, data: updateData });
        return NextResponse.json({ task });
      }
      if (action === 'delete') {
        await db.task.delete({ where: { id: data.id } });
        return NextResponse.json({ success: true });
      }
      if (action === 'toggle') {
        const task = await db.task.findUnique({ where: { id: data.id } });
        if (task) {
          await db.task.update({ where: { id: data.id }, data: { isActive: !task.isActive } });
        }
        return NextResponse.json({ success: true });
      }
    }

    if (section === 'announcements') {
      if (action === 'create') {
        const announcement = await db.announcement.create({ data });
        // Optionally notify all users
        if (data.notifyAll) {
          const users = await db.user.findMany({ where: { isBanned: false }, select: { id: true } });
          await db.notification.createMany({
            data: users.map((u) => ({
              userId: u.id,
              title: announcement.title,
              message: announcement.message,
              type: 'announcement',
            })),
          });
        }
        return NextResponse.json({ announcement });
      }
      if (action === 'update') {
        const { id, ...updateData } = data;
        const announcement = await db.announcement.update({ where: { id }, data: updateData });
        return NextResponse.json({ announcement });
      }
      if (action === 'delete') {
        await db.announcement.delete({ where: { id: data.id } });
        return NextResponse.json({ success: true });
      }
      if (action === 'toggle') {
        const ann = await db.announcement.findUnique({ where: { id: data.id } });
        if (ann) {
          await db.announcement.update({ where: { id: data.id }, data: { isActive: !ann.isActive } });
        }
        return NextResponse.json({ success: true });
      }
    }

    if (section === 'vault_campaigns') {
      if (action === 'create') {
        const campaign = await db.rewardVaultCampaign.create({ data });
        return NextResponse.json({ campaign });
      }
      if (action === 'update') {
        const { id, ...updateData } = data;
        const campaign = await db.rewardVaultCampaign.update({ where: { id }, data: updateData });
        return NextResponse.json({ campaign });
      }
      if (action === 'delete') {
        await db.rewardVaultCampaign.delete({ where: { id: data.id } });
        return NextResponse.json({ success: true });
      }
      if (action === 'reward') {
        // Award vault reward to a user
        await db.vaultReward.create({
          data: {
            userId: data.userId,
            campaignId: data.campaignId,
            amount: data.amount,
          },
        });
        await db.user.update({
          where: { id: data.userId },
          data: { vaultBalance: { increment: data.amount } },
        });
        return NextResponse.json({ success: true });
      }
    }

    if (section === 'roles') {
      if (action === 'create') {
        const role = await db.role.create({ data });
        return NextResponse.json({ role });
      }
      if (action === 'update') {
        const { id, ...updateData } = data;
        const role = await db.role.update({ where: { id }, data: updateData });
        return NextResponse.json({ role });
      }
      if (action === 'delete') {
        // Don't delete if users have this role
        const userCount = await db.user.count({ where: { roleId: data.id } });
        if (userCount > 0) {
          return NextResponse.json({ error: `Cannot delete role: ${userCount} users have this role` }, { status: 400 });
        }
        await db.role.delete({ where: { id: data.id } });
        return NextResponse.json({ success: true });
      }
    }

    if (section === 'settings') {
      if (action === 'update') {
        for (const setting of data.settings) {
          await db.setting.update({
            where: { key: setting.key },
            data: { value: setting.value },
          });
        }
        return NextResponse.json({ success: true });
      }
    }

    if (section === 'ads') {
      if (action === 'create') {
        const ad = await db.adPlacement.create({ data });
        return NextResponse.json({ ad });
      }
      if (action === 'update') {
        const { id, ...updateData } = data;
        const ad = await db.adPlacement.update({ where: { id }, data: updateData });
        return NextResponse.json({ ad });
      }
      if (action === 'delete') {
        await db.adPlacement.delete({ where: { id: data.id } });
        return NextResponse.json({ success: true });
      }
      if (action === 'toggle') {
        const ad = await db.adPlacement.findUnique({ where: { id: data.id } });
        if (ad) {
          await db.adPlacement.update({ where: { id: data.id }, data: { isActive: !ad.isActive } });
        }
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: 'Invalid section or action' }, { status: 400 });
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId || !(await checkAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section');
    const id = searchParams.get('id');

    if (!section || !id) {
      return NextResponse.json({ error: 'Section and ID required' }, { status: 400 });
    }

    // Log
    await db.adminLog.create({
      data: { adminId: userId, action: `delete:${section}`, details: id },
    });

    if (section === 'tasks') {
      await db.task.delete({ where: { id } });
    } else if (section === 'announcements') {
      await db.announcement.delete({ where: { id } });
    } else if (section === 'roles') {
      await db.role.delete({ where: { id } });
    } else if (section === 'ads') {
      await db.adPlacement.delete({ where: { id } });
    } else if (section === 'vault_campaigns') {
      await db.rewardVaultCampaign.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
