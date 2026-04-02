'use client';

import { useState } from 'react';

export default function UpgradeModal({ onClose, onEmailSubmit }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setEmailSent(true);
      if (onEmailSubmit) onEmailSubmit(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {emailSent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You&apos;re all set!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Your email gives you 2 more free generations. Generate away!
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Continue Generating
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Daily limit reached</h3>
              <p className="text-sm text-gray-500 mt-2">
                You&apos;ve used your free generation for today. Pick an option below to keep going.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Get 2 more free generations
                </p>
                <p className="text-xs text-gray-500 mb-3">Enter your email — no credit card needed.</p>
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition"
                  >
                    {submitting ? 'Sending...' : 'Unlock 2 More Generations'}
                  </button>
                </form>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400">or</span>
                </div>
              </div>

              <a
                href="/pricing"
                className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Upgrade to Pro — €9/month
                <span className="block text-xs text-indigo-200 font-normal mt-0.5">Unlimited generations + PDF export</span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
