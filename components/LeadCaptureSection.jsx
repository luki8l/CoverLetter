'use client';

import { useState } from 'react';

export default function LeadCaptureSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes('@')) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing' }),
      });
      if (res.ok) {
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="py-20 px-4 bg-gray-900">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Newsletter</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
          Job hunting tips that actually work
        </h2>
        <p className="text-gray-400 text-base mb-8 max-w-lg mx-auto leading-relaxed">
          One email per week. Cover letter strategy, interview frameworks, and salary negotiation tactics — from people who recently landed offers.
        </p>

        {status === 'done' ? (
          <div className="inline-flex items-center gap-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-6 py-3.5 rounded-xl">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            You&apos;re in. First email coming soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition disabled:opacity-60 whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing…' : 'Get the tips →'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-xs text-red-400">Something went wrong. Please try again.</p>
        )}
        <p className="mt-4 text-xs text-gray-600">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
