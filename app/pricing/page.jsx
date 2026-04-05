'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const FREE_FEATURES = [
  { text: '2 cover letters/day (free account)', included: true },
  { text: 'CV Optimizer (2/day)', included: true },
  { text: 'Job Fit Score — match % + strengths only', included: true },
  { text: '2 of 5 interview questions', included: true },
  { text: 'PDF & Word (.docx) export', included: true },
  { text: 'English & German', included: true },
  { text: 'Gaps analysis (watch-outs)', included: false },
  { text: 'Letter Strategy tip', included: false },
  { text: 'All 5 interview questions', included: false },
  { text: 'Unlimited generations', included: false },
];

const PRO_FEATURES = [
  { text: 'Unlimited cover letter generations', highlight: false },
  { text: 'Unlimited CV optimizations', highlight: false },
  { text: 'Full gaps analysis — what\'s working against you', highlight: true },
  { text: 'Letter Strategy tip — exact angle to lead with', highlight: true },
  { text: 'All 5 interview questions + answer frameworks', highlight: true },
  { text: 'PDF & Word (.docx) export', highlight: false },
  { text: 'All tones & languages', highlight: false },
  { text: 'Priority AI processing', highlight: false },
];

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel your Pro subscription at any time from your account page. Your Pro access stays active until the end of the billing period.',
  },
  {
    q: 'What counts as a "generation"?',
    a: 'Each time you click "Generate Cover Letter" or "Optimize CV" counts as one generation. Job Fit Analysis and Interview Prep do not count toward your limit — but the full gaps analysis and Letter Strategy tip within Job Fit require Pro.',
  },
  {
    q: 'Which AI model is used?',
    a: 'Cover letters use Claude Sonnet by Anthropic — one of the most capable models available, specifically optimized for professional writing.',
  },
  {
    q: 'Is my data stored?',
    a: 'Your form inputs are saved locally in your browser for convenience. Generated letters are not stored on our servers — only anonymous generation counts are tracked to enforce free-tier limits.',
  },
  {
    q: 'What is the Letter Strategy tip?',
    a: 'After analyzing your background vs. the job description, we generate a specific one-sentence strategy: the exact angle and experience to lead with for this particular role. It\'s the most actionable output of the fit analysis — only available on Pro.',
  },
  {
    q: 'How are the interview questions generated?',
    a: 'Questions are generated from the actual job description + your background + your cover letter. They\'re not generic — they reference your specific CV and the JD requirements. Free users get 2; Pro gets all 5 including the Technical, Situational, and Challenge questions.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  async function handleUpgrade() {
    if (!user) {
      window.location.href = '/auth?redirect=/pricing';
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

      <main className="flex-1 w-full px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Simple, honest pricing</h1>
          <p className="text-lg text-gray-500">
            Start free. Upgrade when you need the full workflow.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">

          {/* Free */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Free</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-gray-900">€0</span>
              </div>
              <p className="text-sm text-gray-500">Try it out. See the quality before committing.</p>
            </div>

            <ul className="space-y-2.5 flex-1">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-sm ${f.included ? 'text-gray-700' : 'text-gray-300'}`}>
                  <svg className={`w-4 h-4 mt-0.5 shrink-0 ${f.included ? 'text-emerald-500' : 'text-gray-200'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.included
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    }
                  </svg>
                  {f.text}
                </li>
              ))}
            </ul>

            <Link
              href="/generate"
              className="block text-center border border-gray-200 text-gray-700 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-gray-50 transition"
            >
              Start generating →
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 p-8 flex flex-col gap-6">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                MOST POPULAR
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wide mb-2">Pro</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">€9</span>
                <span className="text-sm text-indigo-200">/month</span>
              </div>
              <p className="text-sm text-indigo-100">For active job seekers who want every edge.</p>
            </div>

            <ul className="space-y-2.5 flex-1">
              {PRO_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={f.highlight ? 'text-white font-semibold' : 'text-indigo-100'}>{f.text}</span>
                  {f.highlight && (
                    <span className="ml-1 text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium shrink-0">Pro</span>
                  )}
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

        {/* What Pro unlocks — visual callout */}
        <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Why Pro is worth it</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Full Gaps Analysis</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Free users see 1 gap. Pro reveals all of them — so you know exactly what to address or explain away in your letter.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Letter Strategy</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">One sentence, generated from your CV vs. the JD: the exact angle to lead with. Turns a generic letter into a targeted one.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">All 5 Interview Questions</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Free gets 2. Pro unlocks Technical, Situational & Challenge — the ones that catch unprepared candidates off guard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQS.map((item, i) => (
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
