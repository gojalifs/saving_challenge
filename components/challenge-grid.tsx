'use client';

import { SAVING_CHALLENGE_DATA } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toggleSaving } from '@/db/actions';
import { useState, useTransition, useRef } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

import confetti from 'canvas-confetti';
import { ShineBorder } from '@/components/ui/shine-border';
import { ToastContainer } from '@/components/ui/toast';

type Entry = {
  weekNumber: number;
  isSaved: boolean;
};

type ToastType = 'success' | 'error' | 'loading' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export function ChallengeGrid({ entries }: { entries: Entry[] }) {
  const [optimisticEntries, setOptimisticEntries] = useState(entries);
  const [, startTransition] = useTransition();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdCounter = useRef(0);

  const addToast = (
    message: string,
    type: ToastType = 'info',
    duration?: number
  ) => {
    toastIdCounter.current += 1;
    const id = `toast-${toastIdCounter.current}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleToggle = (
    week: number,
    currentStatus: boolean,
    event: React.MouseEvent
  ) => {
    const newStatus = !currentStatus;

    if (newStatus) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        origin: { x, y },
        particleCount: 50,
        spread: 60,
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    }

    // Show loading toast
    const toastId = addToast('Menyimpan...', 'loading', 0);

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
      try {
        await toggleSaving(week, newStatus);
        removeToast(toastId);
        addToast('Berhasil disimpan!', 'success', 2000);
      } catch {
        removeToast(toastId);
        addToast('Gagal menyimpan', 'error', 3000);
        // Revert optimistic update on error
        setOptimisticEntries((prev) =>
          prev.map((e) =>
            e.weekNumber === week ? { ...e, isSaved: currentStatus } : e
          )
        );
      }
    });
  };

  return (
    <>
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4'>
        {SAVING_CHALLENGE_DATA.map((item) => {
          const isSaved = optimisticEntries.find(
            (e) => e.weekNumber === item.week
          )?.isSaved;

          const CardContent = (
            <div className='flex flex-col items-center justify-center w-full h-full'>
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
            </div>
          );

          return (
            <motion.div
              key={item.week}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleToggle(item.week, !!isSaved, e)}
              className='rounded-xl overflow-hidden relative'
            >
              {isSaved ? (
                <ShineBorder
                  className='w-full h-full min-h-[100px] min-w-0 bg-[#cff4d2] text-emerald-950 cursor-pointer'
                  shineColor={['#d1fae5', '#10b981', '#059669']}
                >
                  {CardContent}
                </ShineBorder>
              ) : (
                <div
                  className={cn(
                    'w-full h-full min-h-[100px] cursor-pointer rounded-xl border p-4 flex flex-col items-center justify-center transition-all duration-300',
                    'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md text-slate-800'
                  )}
                >
                  {CardContent}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
