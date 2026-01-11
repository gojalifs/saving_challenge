'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;

type Status = 'idle' | 'loading' | 'enabled' | 'denied' | 'unsupported' | 'error';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker not supported');
  }

  const existing = await navigator.serviceWorker.getRegistration('/');
  if (!existing) {
    await navigator.serviceWorker.register('/sw.js');
  }

  return navigator.serviceWorker.ready;
}

async function subscribeToPush(registration: ServiceWorkerRegistration) {
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;
  if (!PUBLIC_VAPID_KEY) throw new Error('Missing VAPID public key');

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });
}

export function NotificationOptIn() {
  const [status, setStatus] = useState<Status>(
    PUBLIC_VAPID_KEY ? 'idle' : 'unsupported'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported =
      'serviceWorker' in navigator &&
      typeof Notification !== 'undefined' &&
      'PushManager' in window;
    setIsSupported(supported);
    if (!supported) {
      setStatus('unsupported');
    }
  }, []);

  useEffect(() => {
    if (!isSupported || typeof navigator === 'undefined') return;
    (async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        if (!registration) {
          await navigator.serviceWorker.register('/sw.js');
        }
      } catch (error) {
        console.error('Failed to pre-register service worker', error);
      }
    })();
  }, [isSupported]);

  const handleEnable = useCallback(async () => {
    if (!isSupported || typeof Notification === 'undefined') {
      setStatus('unsupported');
      setErrorMessage('Browser kamu belum mendukung Push API.');
      return;
    }

    if (!PUBLIC_VAPID_KEY) {
      setStatus('unsupported');
      setErrorMessage('NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY belum dikonfigurasi.');
      return;
    }

    try {
      setStatus('loading');
      setErrorMessage('');

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'idle');
        return;
      }

      const registration = await registerServiceWorker();
      const subscription = await subscribeToPush(registration);

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to save subscription');
      }

      setStatus('enabled');
    } catch (error) {
      console.error('Failed to enable notifications', error);
      setStatus('error');
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unknown error enabling notifications');
      }
    }
  }, [isSupported]);

  const buttonLabel = useMemo(() => {
    switch (status) {
      case 'loading':
        return 'Mengaktifkan...';
      case 'enabled':
        return 'Notifikasi Aktif';
      case 'denied':
        return 'Izin Ditolak';
      case 'unsupported':
        return 'Tidak Didukung';
      case 'error':
      case 'idle':
      default:
        return 'Aktifkan Notifikasi Akhir Pekan';
    }
  }, [status]);

  const isButtonDisabled =
    status === 'loading' || status === 'enabled' || status === 'unsupported';

  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
      <h2 className='text-xl font-semibold text-slate-900'>
        Notifikasi Pengingat
      </h2>
      <p className='mt-2 text-sm text-slate-500'>
        Terima push notification setiap Jumat, Sabtu, dan Minggu jika minggu ini
        belum kamu tandai sebagai selesai.
      </p>
      {!isSupported && (
        <p className='mt-4 text-sm font-medium text-red-500'>
          Browser kamu belum mendukung Push API.
        </p>
      )}
      {errorMessage && (
        <p className='mt-4 text-sm font-medium text-red-500'>{errorMessage}</p>
      )}
      <button
        type='button'
        onClick={handleEnable}
        disabled={isButtonDisabled}
        className='mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300'
      >
        {buttonLabel}
      </button>
      {status === 'denied' && (
        <p className='mt-2 text-xs text-slate-400'>
          Buka pengaturan browser untuk mengizinkan notifikasi dari situs ini.
        </p>
      )}
    </div>
  );
}
