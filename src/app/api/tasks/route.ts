import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const tasks = await db.task.findMany({
      where: { isActive: true },
      include: {
        completions: userId ? {
          where: { userId: userId },
        } : false,
      },
      orderBy: { createdAt: 'asc' },
    });

    const tasksWithStatus = tasks.map(task => ({
      ...task,
      completed: task.completions && task.completions.length > 0,
      completions: undefined,
    }));

    return NextResponse.json({ tasks: tasksWithStatus });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, taskId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'complete') {
      if (!taskId) {
        return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
      }

      const task = await db.task.findUnique({ where: { id: taskId } });
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      // Check if already completed
      const existing = await db.taskCompletion.findUnique({
        where: { userId_taskId: { userId, taskId } },
      });

      if (existing) {
        return NextResponse.json({ error: 'Task already completed' }, { status: 400 });
      }

      // Get multipliers
      const taskMultiplierSetting = await db.setting.findUnique({ where: { key: 'task_multiplier' } });
      const taskMultiplier = taskMultiplierSetting ? parseFloat(taskMultiplierSetting.value) : 1;
      const vaultMultiplierSetting = await db.setting.findUnique({ where: { key: 'vault_multiplier' } });
      const vaultMultiplier = vaultMultiplierSetting ? parseFloat(vaultMultiplierSetting.value) : 1;

      const nxrReward = task.nxrReward * taskMultiplier;
      const vaultReward = task.vaultReward * vaultMultiplier;

      // Complete task
      await db.taskCompletion.create({
        data: { userId, taskId },
      });

      // Update user balance
      await db.user.update({
        where: { id: userId },
        data: {
          nxrBalance: { increment: nxrReward },
          vaultBalance: { increment: vaultReward },
          tasksCompleted: { increment: 1 },
        },
      });

      // Add vault reward to campaign
      const activeCampaign = await db.rewardVaultCampaign.findFirst({ where: { isActive: true } });
      if (activeCampaign) {
        await db.vaultReward.create({
          data: {
            userId,
            campaignId: activeCampaign.id,
            amount: vaultReward,
          },
        });
      }

      // Create notification
      await db.notification.create({
        data: {
          userId,
          title: 'Task Completed!',
          message: `You earned ${nxrReward} NXR and $${vaultReward.toFixed(2)} vault reward for completing "${task.title}"!`,
          type: 'reward',
        },
      });

      return NextResponse.json({
        reward: { nxr: nxrReward, vault: vaultReward },
        message: 'Task completed!',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
