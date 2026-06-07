import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const status: Record<string, any> = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasGmailUser: !!process.env.GMAIL_USER,
      hasGmailAppPassword: !!process.env.GMAIL_APP_PASSWORD,
      nodeEnv: process.env.NODE_ENV,
    },
  };

  try {
    // Test database connection
    await db.$queryRaw`SELECT 1 as test`;
    status.database = 'connected';

    // Get table counts
    try {
      status.counts = {
        users: await db.user.count(),
        roles: await db.role.count(),
        settings: await db.setting.count(),
        tasks: await db.task.count(),
      };
    } catch {
      status.counts = 'tables may not exist yet - run /api/setup';
    }

    status.status = 'healthy';
  } catch (dbError: any) {
    status.database = 'disconnected';
    status.databaseError = dbError.message?.substring(0, 200);
    status.status = 'unhealthy';
    status.hint = 'DATABASE_URL is missing or invalid. Set it in Vercel Environment Variables. Use Neon (neon.tech), Supabase, or any PostgreSQL provider.';
  }

  const statusCode = status.status === 'healthy' ? 200 : 503;
  return NextResponse.json(status, { status: statusCode });
}
