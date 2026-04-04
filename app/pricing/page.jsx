'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';
import PricingCard from '@/components/PricingCard';

const FREE_FEATURES = [
  '1 generation per day',
  'All tones (Professional, Enthusiastic, Creative)',
  'English & German',
  'Download as .txt',
  'Copy to clipboard',
];

const PRO_FEATURES = [
  'Unlimited generations',
  'Cover letter generator',
  'CV Optimizer',
  'All tones & languages',
  'PDF download & print',
  'Priority AI processing',
];

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  async function handleUpgrade() {
    if (!user) {
      router.push('/auth?redirect=/pricing');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      alert('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, honest pricing</h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <PricingCard
            name="Free"
            price="Free"
            description="Perfect for a one-time application or trying it out."
            features={FREE_FEATURES}
            cta="Start generating"
            ctaHref="/generate"
          />

          <div className="relative rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 p-8 flex flex-col gap-6">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">Pro</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold">€9</span>
                <span className="text-sm text-indigo-200">/month</span>
              </div>
              <p className="mt-2 text-sm text-indigo-100">
                For active job seekers applying to multiple roles.
              </p>
            </div>

            <ul className="space-y-3 flex-1">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-indigo-50">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-white text-indigo-600 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-50 disabled:opacity-70 transition"
            >
              {loading ? 'Redirecting…' : user ? 'Upgrade to Pro →' : 'Sign in to upgrade →'}
            </button>

            {!user && (
              <p className="text-center text-xs text-indigo-300 -mt-3">
                You&apos;ll be asked to sign in first
              </p>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel your Pro subscription at any time from your account page. No questions asked.',
              },
              {
                q: 'What counts as a "generation"?',
                a: 'Each time you click "Generate Cover Letter" or "Optimize CV" counts as one generation.',
              },
              {
                q: 'Which AI model is used?',
                a: 'We use Claude Sonnet by Anthropic — one of the most capable language models available, optimized for professional writing.',
              },
              {
                q: 'Is my data saved?',
                a: 'Your form inputs are saved locally in your browser. Your generated content is never stored on our servers.',
              },
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>
    </div>
  );
}
