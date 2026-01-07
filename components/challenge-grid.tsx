'use client';

import { SAVING_CHALLENGE_DATA } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toggleSaving } from '@/db/actions';
import { useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

type Entry = {
  weekNumber: number;
  isSaved: boolean;
};

export function ChallengeGrid({ entries }: { entries: Entry[] }) {
  const [optimisticEntries, setOptimisticEntries] = useState(entries);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (week: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    // Optimistic update
    setOptimisticEntries((prev) => {
      const existing = prev.find((e) => e.weekNumber === week);
      if (existing) {
        return prev.map((e) =>
          e.weekNumber === week ? { ...e, isSaved: newStatus } : e
        );
      }
      return [...prev, { weekNumber: week, isSaved: newStatus }];
    });

    startTransition(async () => {
      await toggleSaving(week, newStatus);
    });
  };

  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4',
        isPending && 'opacity-70 pointer-events-none'
      )}
    >
      {SAVING_CHALLENGE_DATA.map((item) => {
        const isSaved = optimisticEntries.find(
          (e) => e.weekNumber === item.week
        )?.isSaved;

        return (
          <motion.div
            key={item.week}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggle(item.week, !!isSaved)}
            className={cn(
              'relative cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center transition-all duration-300 min-h-[100px]',
              isSaved
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md text-slate-800'
            )}
          >
            <div className='absolute top-2 left-2 text-xs font-bold opacity-70'>
              Week {item.week}
            </div>
            {isSaved && (
              <div className='absolute top-2 right-2'>
                <Check className='w-4 h-4' />
              </div>
            )}
            <div className='text-xl font-bold'>
              {new Intl.NumberFormat('id-ID').format(item.amount / 1000)}
            </div>
            <div className='text-xs opacity-60'>ribuan</div>
          </motion.div>
        );
      })}
    </div>
  );
}
