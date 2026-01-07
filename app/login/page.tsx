'use client';

import { signIn } from '@/lib/auth-client';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center relative overflow-hidden'>
      {/* Background Image */}
      <div
        className='absolute inset-0 z-0 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: 'url("/login-bg.jpg")' }}
      >
        <div className='absolute inset-0 bg-black/40 backdrop-blur-[2px]' />
      </div>

      <div className='bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/50 max-w-sm w-full text-center space-y-6 relative z-10 mx-4'>
        <div>
          <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
            Saving Challenge
          </h1>
          <p className='text-slate-600 mt-2 font-medium'>
            Sign in to start your Rp30M journey
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className='w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm'
        >
          {loading ? (
            <span className='animate-pulse'>Connecting...</span>
          ) : (
            <>
              <svg className='w-5 h-5' viewBox='0 0 24 24'>
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
