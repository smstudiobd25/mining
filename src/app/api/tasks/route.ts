import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await db.task.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    const completions = await db.taskCompletion.findMany({
      where: { userId },
    });

    const completedIds = new Set(completions.map((c) => c.taskId));
    const taskMultiplierSetting = await db.setting.findUnique({ where: { key: 'task_multiplier' } });
    const vaultMultiplierSetting = await db.setting.findUnique({ where: { key: 'vault_multiplier' } });
    const taskMultiplier = taskMultiplierSetting ? parseFloat(taskMultiplierSetting.value) : 1;
    const vaultMultiplier = vaultMultiplierSetting ? parseFloat(vaultMultiplierSetting.value) : 1;

    const tasksWithStatus = tasks.map((task) => ({
      ...task,
      nxrReward: Math.round(task.nxrReward * taskMultiplier * 100) / 100,
      vaultReward: Math.round(task.vaultReward * vaultMultiplier * 100) / 100,
      completed: completedIds.has(task.id),
    }));

    return NextResponse.json({
      tasks: tasksWithStatus,
      completedCount: completions.length,
      totalCount: tasks.length,
    });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await db.task.findUnique({ where: { id: taskId } });
    if (!task || !task.isActive) {
      return NextResponse.json({ error: 'Task not found or inactive' }, { status: 404 });
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
    const vaultMultiplierSetting = await db.setting.findUnique({ where: { key: 'vault_multiplier' } });
    const taskMultiplier = taskMultiplierSetting ? parseFloat(taskMultiplierSetting.value) : 1;
    const vaultMultiplier = vaultMultiplierSetting ? parseFloat(vaultMultiplierSetting.value) : 1;

    const nxrReward = Math.round(task.nxrReward * taskMultiplier * 100) / 100;
    const vaultReward = Math.round(task.vaultReward * vaultMultiplier * 100) / 100;

    // Complete the task
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

    // Notify
    await db.notification.create({
      data: {
        userId,
        title: 'Task Completed! ✅',
        message: `You earned ${nxrReward} NXR + $${vaultReward} Vault for completing "${task.title}"`,
        type: 'task',
      },
    });

    return NextResponse.json({
      success: true,
      nxrReward,
      vaultReward,
      message: `Earned ${nxrReward} NXR + $${vaultReward} Vault!`,
    });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
