import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('Authorization');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json(
      { status: 'ok', message: 'Database is alive', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error('Keep-alive failed:', error);
    return NextResponse.json(
      { status: 'error', message: 'Database ping failed' },
      { status: 500 }
    );
  }
}
