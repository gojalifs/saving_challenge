'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'loading' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, type, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg transition-all duration-300',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        type === 'success' && 'bg-emerald-500 text-white',
        type === 'error' && 'bg-red-500 text-white',
        type === 'loading' && 'bg-blue-500 text-white',
        type === 'info' && 'bg-slate-700 text-white'
      )}
    >
      {type === 'loading' && (
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
      )}
      <span className='text-sm font-medium'>{message}</span>
      {type !== 'loading' && (
        <button
          onClick={handleClose}
          className='ml-2 rounded-full p-0.5 hover:bg-white/20 transition-colors'
        >
          <X className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </>
  );
}
