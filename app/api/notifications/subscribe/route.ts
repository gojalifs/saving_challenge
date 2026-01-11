import { NextResponse } from 'next/server';
import {
  registerPushSubscription,
  unregisterPushSubscription,
} from '@/db/actions';

type SubscriptionBody = {
  subscription?: {
    endpoint?: string;
    keys?: {
      auth?: string;
      p256dh?: string;
    };
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubscriptionBody;
    const subscription = body.subscription;

    if (
      !subscription?.endpoint ||
      !subscription.keys?.auth ||
      !subscription.keys?.p256dh
    ) {
      return NextResponse.json(
        { error: 'Invalid subscription payload' },
        { status: 400 }
      );
    }

    await registerPushSubscription({
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to register push subscription', error);
    return NextResponse.json(
      { error: 'Unable to register subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { endpoint?: string };
    if (!body.endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint' },
        { status: 400 }
      );
    }

    await unregisterPushSubscription(body.endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unregister push subscription', error);
    return NextResponse.json(
      { error: 'Unable to unregister subscription' },
      { status: 500 }
    );
  }
}
