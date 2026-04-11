'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

const TYPES = [
  {
    id: 'cold-recruiter',
    label: 'Cold Outreach',
    desc: 'Message a recruiter or HM you have no prior connection with.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  },
  {
    id: 'open-role',
    label: 'Open Role',
    desc: 'You saw a job posting and want to stand out from the crowd.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
  },
  {
    id: 'connection-request',
    label: 'Connection Request',
    desc: 'The 300-character note that gets your request accepted.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />,
  },
];

const LANGUAGES = ['English', 'Deutsch'];
const CHAR_LIMIT = { 'connection-request': 300 };

export default function LinkedInPage() {
  const [type, setType] = useState('cold-recruiter');
  const [language, setLanguage] = useState('English');
  const [form, setForm] = useState({
    yourName: '', yourBackground: '',
    recipientName: '', recipientTitle: '',
    company: '', role: '', mutualContext: '',
  });
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

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
      const res = await fetch('/api/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, language, ...form }),
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

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const charLimit = CHAR_LIMIT[type];
  const charCount = output.length;
  const overLimit = charLimit && charCount > charLimit;

  const fieldClass = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">LinkedIn Message Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stop sending generic &ldquo;I am interested&rdquo; messages. Write something recruiters actually reply to.
          </p>
        </div>

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
              <svg className={`w-5 h-5 ${type === t.id ? 'text-indigo-200' : 'text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {t.icon}
              </svg>
              <div>
                <p className={`text-sm font-semibold ${type === t.id ? 'text-white' : 'text-gray-900'}`}>{t.label}</p>
                <p className={`text-xs mt-0.5 leading-snug ${type === t.id ? 'text-indigo-200' : 'text-gray-400'}`}>{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={generate} className="space-y-5">

            {/* About you */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">About you</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
                  <input type="text" value={form.yourName} onChange={set('yourName')} placeholder="Alex Johnson" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your background
                    <span className="ml-1 text-gray-400 font-normal text-xs">(brief — role, yrs exp, key skill)</span>
                  </label>
                  <input type="text" value={form.yourBackground} onChange={set('yourBackground')} placeholder="5yr PM at SaaS companies, B2B focus" className={fieldClass} />
                </div>
              </div>
            </div>

            {/* About recipient */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">About them</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Their name <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                  <input type="text" value={form.recipientName} onChange={set('recipientName')} placeholder="Sarah Chen" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Their title <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                  <input type="text" value={form.recipientTitle} onChange={set('recipientTitle')} placeholder="Senior Recruiter" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Company <span className="text-red-500">*</span></label>
                  <input type="text" value={form.company} onChange={set('company')} required placeholder="Stripe" className={fieldClass} />
                </div>
                {type !== 'cold-recruiter' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role / Position</label>
                    <input type="text" value={form.role} onChange={set('role')} placeholder="Senior Product Manager" className={fieldClass} />
                  </div>
                )}
              </div>
            </div>

            {/* Mutual context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mutual connection or context
                <span className="ml-1 text-gray-400 font-normal text-xs">(optional but powerful)</span>
              </label>
              <input type="text" value={form.mutualContext} onChange={set('mutualContext')} placeholder="e.g. We both went to TU Vienna / I saw your talk at Config 2024 / John Smith suggested I reach out" className={fieldClass} />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <div className="flex gap-2">
                {LANGUAGES.map((l) => (
                  <button key={l} type="button"
                    onClick={() => setLanguage(l)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      language === l ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {type === 'connection-request' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <p className="text-xs text-amber-800 font-medium">
                  LinkedIn connection request notes are limited to <strong>300 characters</strong>. The message will be kept within this limit.
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
            >
              {isLoading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Writing…</>
              ) : 'Generate message →'}
            </button>
          </form>
        </div>

        {/* Output */}
        {(output || isStreaming) && (
          <div className="mt-6 space-y-3">
            {!isStreaming && (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-gray-900">Your message</h2>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                    overLimit ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    {charCount} chars{charLimit ? ` / ${charLimit}` : ''}
                  </span>
                </div>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  {copied ? (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy message</>
                  )}
                </button>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
              <div className="px-6 sm:px-8 py-6 text-[15px] text-gray-800 leading-[1.85] whitespace-pre-wrap">
                {output}
                {isStreaming && <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />}
              </div>
            </div>
            {overLimit && !isStreaming && (
              <p className="text-xs text-red-600 text-center">
                Over the {charLimit}-character limit. Try regenerating — the AI will trim it.
              </p>
            )}
            {!isStreaming && (
              <p className="text-xs text-gray-400 text-center">Not quite right? Adjust the details and regenerate.</p>
            )}
          </div>
        )}

        {/* Cross-sell */}
        {output && !isStreaming && (
          <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Need a cover letter too?</p>
              <p className="text-xs text-gray-500 mt-0.5">CoverDraft generates a full, tailored cover letter with job fit score in 60 seconds.</p>
            </div>
            <a href="/generate" className="shrink-0 text-xs font-semibold bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition">
              Generate cover letter →
            </a>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>
    </div>
  );
}
