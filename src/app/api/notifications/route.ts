import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Also get active announcements
    const announcements = await db.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({ notifications, announcements, unreadCount });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, notificationId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (action === 'mark_read') {
      if (notificationId) {
        await db.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });
      } else {
        // Mark all as read
        await db.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });
      }
      return NextResponse.json({ message: 'Notifications marked as read' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
