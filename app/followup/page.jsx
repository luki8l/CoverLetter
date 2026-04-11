'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

const TYPES = [
  {
    id: 'follow-up',
    label: 'Application Follow-up',
    shortLabel: 'Follow-up',
    desc: 'Check in on your application ~1 week after submitting.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    id: 'thank-you',
    label: 'Interview Thank-you',
    shortLabel: 'Thank-you',
    desc: 'Send within 24h. This one email often decides the offer.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    ),
  },
  {
    id: 'rejection',
    label: 'Rejection Recovery',
    shortLabel: 'Rejection',
    desc: 'Respond gracefully. Keep the door open for the future.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    ),
  },
];

const LANGUAGES = ['English', 'Deutsch'];

function parseEmail(raw) {
  const lines = raw.split('\n');
  let subject = '';
  let bodyStart = 0;
  if (lines[0]?.startsWith('Subject:')) {
    subject = lines[0].replace(/^Subject:\s*/i, '').trim();
    bodyStart = lines[1] === '' ? 2 : 1;
  }
  const body = lines.slice(bodyStart).join('\n');
  return { subject, body };
}

function FollowUpPageInner() {
  const searchParams = useSearchParams();
  const [type, setType] = useState('follow-up');
  const [form, setForm] = useState({
    company: '',
    jobTitle: '',
    interviewerName: '',
    discussedTopics: '',
    appliedDate: '',
    language: 'English',
  });
  const [output, setOutput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  // Pre-fill from query params (when coming from tracker)
  useEffect(() => {
    const company = searchParams.get('company');
    const role = searchParams.get('role');
    const t = searchParams.get('type');
    if (company || role) {
      setForm(prev => ({ ...prev, company: company || prev.company, jobTitle: role || prev.jobTitle }));
    }
    if (t && TYPES.find(x => x.id === t)) setType(t);
  }, [searchParams]);

  function set(field) {
    return (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function generate(e) {
    e.preventDefault();
    setIsLoading(true);
    setIsStreaming(false);
    setOutput('');
    setError('');

    try {
      const res = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...form }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        return;
      }

      setIsStreaming(true);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setOutput(result);
      }
      setIsStreaming(false);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  async function copyText(text, key) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  function openMailto() {
    const { subject, body } = parseEmail(output);
    const link = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(link, '_blank');
  }

  const { subject, body } = parseEmail(output);
  const fieldClass = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white';
  const currentType = TYPES.find(t => t.id === type);

  return (
    <>
      {/* Type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setType(t.id)}
            className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition ${
              type === t.id
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
            }`}
          >
            <svg
              className={`w-5 h-5 ${type === t.id ? 'text-indigo-200' : 'text-indigo-500'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              {t.icon}
            </svg>
            <div>
              <p className={`text-sm font-semibold ${type === t.id ? 'text-white' : 'text-gray-900'}`}>{t.label}</p>
              <p className={`text-xs mt-0.5 leading-snug ${type === t.id ? 'text-indigo-200' : 'text-gray-400'}`}>{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={generate} className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.company} onChange={set('company')}
                required placeholder="e.g. Stripe"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text" value={form.jobTitle} onChange={set('jobTitle')}
                required placeholder="e.g. Senior Product Manager"
                className={fieldClass}
              />
            </div>
          </div>

          {/* Type-specific fields */}
          {type === 'thank-you' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Interviewer Name
                  <span className="ml-1 text-gray-400 font-normal text-xs">(makes it personal)</span>
                </label>
                <input
                  type="text" value={form.interviewerName} onChange={set('interviewerName')}
                  placeholder="e.g. Sarah, or Sarah Chen"
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  What did you talk about?
                  <span className="ml-1 text-gray-400 font-normal text-xs">(specific topics make this 10x better)</span>
                </label>
                <textarea
                  value={form.discussedTopics} onChange={set('discussedTopics')}
                  rows={3}
                  placeholder="e.g. their API redesign project, challenges scaling the team, my work on X at Y company…"
                  className={`${fieldClass} resize-none`}
                />
              </div>
            </>
          )}

          {type === 'follow-up' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                When did you apply?
                <span className="ml-1 text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="date" value={form.appliedDate} onChange={set('appliedDate')}
                className={fieldClass}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button key={l} type="button"
                  onClick={() => setForm(prev => ({ ...prev, language: l }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    form.language === l
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Writing…
              </>
            ) : `Generate ${currentType?.shortLabel} Email →`}
          </button>
        </form>
      </div>

      {/* Output */}
      {(output || isStreaming) && (
        <div className="mt-6 space-y-3">
          {/* Action bar */}
          {!isStreaming && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-bold text-gray-900">{currentType?.label}</h2>
              <div className="flex items-center gap-2">
                {subject && (
                  <button
                    onClick={() => copyText(subject, 'subject')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    {copied === 'subject' ? '✓ Subject copied' : 'Copy subject'}
                  </button>
                )}
                <button
                  onClick={() => copyText(output, 'all')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  {copied === 'all'
                    ? <><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                    : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy all</>
                  }
                </button>
                <button
                  onClick={openMailto}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Open in email client
                </button>
              </div>
            </div>
          )}

          {/* Email card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400" />
            <div className="px-6 sm:px-8 py-6">
              {subject && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Subject</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{subject}</p>
                </div>
              )}
              <div className="text-[15px] text-gray-800 leading-[1.85] whitespace-pre-wrap">
                {body}
                {isStreaming && <span className="streaming-cursor" />}
              </div>
            </div>
          </div>

          {!isStreaming && (
            <p className="text-xs text-gray-400 text-center">
              Not quite right? Adjust the details above and regenerate.
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default function FollowUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Follow-up Email Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            The right email at the right moment changes outcomes. Free, no account needed.
          </p>
        </div>

        <Suspense fallback={null}>
          <FollowUpPageInner />
        </Suspense>
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>
    </div>
  );
}
