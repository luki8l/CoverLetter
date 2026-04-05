'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SESSION_KEY = 'coverdraft-nudge-dismissed';

const BENEFITS = [
  '2 letters per day instead of 1',
  'Your letters are saved — never lose them',
  'Track applications with status updates',
  'Interview prep + follow-up email tools',
];

export default function SignupNudge({ onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
    onDismiss?.();
  }

  async function handleEmailCapture(e) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setEmailLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'generate-nudge' }),
      });
      setEmailSent(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch { /* ignore */ } finally {
      setEmailLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="mt-4 bg-white border border-indigo-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">This letter lives only in this tab</p>
              <p className="text-xs text-gray-500 mt-0.5">Create a free account to save it — and get 2 letters/day instead of 1.</p>
            </div>
          </div>
          <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 transition shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
          {BENEFITS.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {i === 0 ? <span className="font-semibold text-indigo-700">{b}</span> : b}
            </div>
          ))}
        </div>

        {emailSent ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>Got it! <Link href="/auth" className="font-semibold underline">Finish signing up</Link> to save your letter.</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/auth"
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Create free account — 10 seconds
            </Link>
            <form onSubmit={handleEmailCapture} className="flex gap-2 flex-1">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Or just leave your email"
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-0"
              />
              <button
                type="submit"
                disabled={emailLoading}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition disabled:opacity-50 whitespace-nowrap"
              >
                {emailLoading ? '…' : 'Save'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
