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
    <div className='min-h-screen flex items-center justify-center bg-slate-50'>
      <div className='bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full text-center space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900'>Welcome Back</h1>
          <p className='text-slate-500 mt-2'>
            Sign in to track your saving progress
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className='w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2'
        >
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}
