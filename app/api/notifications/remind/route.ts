import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { db } from '@/db';
import { notificationSubscriptions, savingsEntries } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  getCurrentWeekNumber,
  getDateKey,
  isReminderDay,
  isSameDay,
} from '@/lib/reminders';

const REMINDER_SECRET = process.env.REMINDER_SECRET;
const WEB_PUSH_PUBLIC_KEY = process.env.WEB_PUSH_PUBLIC_KEY;
const WEB_PUSH_PRIVATE_KEY = process.env.WEB_PUSH_PRIVATE_KEY;
const WEB_PUSH_CONTACT = process.env.WEB_PUSH_CONTACT_EMAIL || 'mailto:admin@example.com';

if (WEB_PUSH_PUBLIC_KEY && WEB_PUSH_PRIVATE_KEY) {
  webpush.setVapidDetails(
    WEB_PUSH_CONTACT,
    WEB_PUSH_PUBLIC_KEY,
    WEB_PUSH_PRIVATE_KEY
  );
}

type SubscriptionRecord = {
  id: number;
  userId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  lastReminderAt: Date | null;
};

export async function POST(request: Request) {
  if (!REMINDER_SECRET) {
    return NextResponse.json(
      { error: 'REMINDER_SECRET is not configured' },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get('x-reminder-key');
  if (providedSecret !== REMINDER_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!WEB_PUSH_PUBLIC_KEY || !WEB_PUSH_PRIVATE_KEY) {
    return NextResponse.json(
      { error: 'Web Push VAPID keys are not configured' },
      { status: 500 }
    );
  }

  const now = new Date();
  if (!isReminderDay(now)) {
    return NextResponse.json({ skipped: 'today is not a reminder day' });
  }

  const currentWeek = getCurrentWeekNumber(now);

  const subscriptions = (await db
    .select()
    .from(notificationSubscriptions)) as SubscriptionRecord[];

  if (!subscriptions.length) {
    return NextResponse.json({ sent: 0, reason: 'no subscriptions' });
  }

  const savedUsers = await db
    .select({ userId: savingsEntries.userId })
    .from(savingsEntries)
    .where(
      and(
        eq(savingsEntries.weekNumber, currentWeek),
        eq(savingsEntries.isSaved, true)
      )
    );

  const savedSet = new Set(savedUsers.map((entry) => entry.userId));
  const todayKey = getDateKey(now);

  let sent = 0;
  let cleaned = 0;

  for (const subscription of subscriptions) {
    if (savedSet.has(subscription.userId)) {
      continue;
    }

    if (subscription.lastReminderAt && isSameDay(subscription.lastReminderAt, now)) {
      continue;
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.auth,
        p256dh: subscription.p256dh,
      },
    };

    const payload = JSON.stringify({
      title: 'Saving Challenge',
      body: 'Belum cek tantangan minggu ini? Saatnya setor tabunganmu!',
      data: {
        url: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || '/',
        dateKey: todayKey,
      },
    });

    try {
      await webpush.sendNotification(pushSubscription, payload);
      sent += 1;
      await db
        .update(notificationSubscriptions)
        .set({ lastReminderAt: now, updatedAt: now })
        .where(eq(notificationSubscriptions.id, subscription.id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Failed to send push notification', error);
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        cleaned += 1;
        await db
          .delete(notificationSubscriptions)
          .where(eq(notificationSubscriptions.id, subscription.id));
      }
    }
  }

  return NextResponse.json({ sent, cleaned, total: subscriptions.length });
}
