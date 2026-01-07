import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProgress } from '@/db/actions';
import { ChallengeGrid } from '@/components/challenge-grid';
import { TOTAL_GOAL } from '@/lib/constants';
import { LogoutButton } from '@/components/logout-button';

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const { entries, totalSaved } = await getProgress();
  const progressPercentage = (totalSaved / TOTAL_GOAL) * 100;

  return (
    <main className='min-h-screen bg-slate-50 p-6 md:p-12'>
      <div className='max-w-6xl mx-auto space-y-8'>
        <header className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
          <div>
            <h1 className='text-3xl font-black text-slate-900 tracking-tight'>
              Saving Challenge
            </h1>
            <div className='flex items-center gap-3 mt-1'>
              <p className='text-slate-500 text-lg'>
                Rp30 juta dalam 52 minggu
              </p>
              <div className='h-1 w-1 rounded-full bg-slate-300 hidden md:block' />
              <span className='text-sm font-medium text-slate-400 hidden md:inline-block'>
                Welcome, {session.user.name}
              </span>
            </div>
          </div>
          <div className='flex flex-col md:flex-row gap-4 w-full md:w-auto items-stretch md:items-center'>
            <div className='bg-white p-4 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto min-w-[300px]'>
              <div className='flex justify-between items-end mb-2'>
                <span className='text-sm font-medium text-slate-500'>
                  Total Saved
                </span>
                <span className='text-2xl font-bold text-emerald-600'>
                  Rp{new Intl.NumberFormat('id-ID').format(totalSaved)}
                </span>
              </div>
              <div className='h-3 w-full bg-slate-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out'
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className='mt-2 text-right text-xs text-slate-400'>
                {progressPercentage.toFixed(1)}% of Rp30.000.000
              </div>
            </div>

            <div className='flex items-center justify-end'>
              <LogoutButton />
            </div>
          </div>
        </header>

        <ChallengeGrid entries={entries} />
      </div>
    </main>
  );
}
