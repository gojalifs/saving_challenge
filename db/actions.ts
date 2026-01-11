'use server';

import { auth } from '@/lib/auth';
import { db } from '@/db';
import { notificationSubscriptions, savingsEntries } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function toggleSaving(weekNumber: number, isSaved: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const existingEntry = await db.query.savingsEntries.findFirst({
    where: and(
      eq(savingsEntries.userId, userId),
      eq(savingsEntries.weekNumber, weekNumber)
    ),
  });

  const amount = (await import('@/lib/constants')).SAVING_CHALLENGE_DATA.find(
    (d) => d.week === weekNumber
  )?.amount;

  if (!amount) throw new Error('Invalid week');

  if (existingEntry) {
    await db
      .update(savingsEntries)
      .set({ isSaved, savedAt: isSaved ? new Date() : null })
      .where(eq(savingsEntries.id, existingEntry.id));
  } else {
    await db.insert(savingsEntries).values({
      userId,
      weekNumber,
      amount,
      isSaved,
      savedAt: isSaved ? new Date() : null,
    });
  }

  revalidatePath('/');
  return { success: true };
}

export async function getProgress() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { entries: [], totalSaved: 0 };

  const entries = await db.query.savingsEntries.findMany({
    where: eq(savingsEntries.userId, session.user.id),
  });

  const saved = entries.filter((e) => e.isSaved);
  const totalSaved = saved.reduce((acc, curr) => acc + curr.amount, 0);

  return { entries, totalSaved };
}

type PushSubscriptionKeys = {
  auth: string;
  p256dh: string;
};

type PushSubscriptionPayload = {
  endpoint: string;
  keys: PushSubscriptionKeys;
};

export async function registerPushSubscription(
  subscription: PushSubscriptionPayload
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { endpoint, keys } = subscription;
  if (!endpoint || !keys?.auth || !keys?.p256dh) {
    throw new Error('Invalid subscription payload');
  }

  const now = new Date();

  await db
    .insert(notificationSubscriptions)
    .values({
      userId: session.user.id,
      endpoint,
      auth: keys.auth,
      p256dh: keys.p256dh,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: notificationSubscriptions.endpoint,
      set: {
        userId: session.user.id,
        auth: keys.auth,
        p256dh: keys.p256dh,
        updatedAt: now,
      },
    });

  return { success: true };
}

export async function unregisterPushSubscription(endpoint: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  await db
    .delete(notificationSubscriptions)
    .where(
      and(
        eq(notificationSubscriptions.endpoint, endpoint),
        eq(notificationSubscriptions.userId, session.user.id)
      )
    );

  return { success: true };
}
