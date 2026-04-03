'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/generate';
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(urlError ? 'Something went wrong. Please try again.' : '');

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push(redirect);
    });
  }, [redirect, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (mode === 'reset') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/callback?next=/account`,
      });
      setLoading(false);
      if (error) { setError(error.message); return; }
      setMessage('Check your email for a password reset link.');
      return;
    }

    if (mode === 'signup') {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?next=${redirect}`,
        },
      });
      setLoading(false);
      if (error) { setError(error.message); return; }
      setMessage('Almost there — check your email to confirm your account.');
      return;
    }

    // Sign in
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message
      );
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  const titles = {
    signin: 'Sign in to CoverDraft',
    signup: 'Create your account',
    reset: 'Reset password',
  };

  const btnLabels = {
    signin: 'Sign in',
    signup: 'Create account',
    reset: 'Send reset link',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-bold text-gray-900">CoverDraft</span>
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-sm p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{titles[mode]}</h1>

        {message ? (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 text-sm text-green-800 text-center">
            {message}
            <button
              onClick={() => { setMessage(''); setMode('signin'); }}
              className="block mx-auto mt-3 text-xs text-green-600 underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password" required={mode !== 'reset'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                  minLength={mode === 'signup' ? 8 : undefined}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {loading ? 'Please wait…' : btnLabels[mode]}
            </button>

            {mode === 'signin' && (
              <button
                type="button" onClick={() => { setMode('reset'); setError(''); }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition"
              >
                Forgot password?
              </button>
            )}
          </form>
        )}

        {/* Mode toggle */}
        {!message && (
          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            {mode === 'signin' ? (
              <>No account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); }}
                  className="text-indigo-600 font-medium hover:underline">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('signin'); setError(''); }}
                  className="text-indigo-600 font-medium hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400">
        By signing up you agree to our terms and privacy policy.
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
      <AuthForm />
    </Suspense>
  );
}
