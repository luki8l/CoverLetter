'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

const TYPES = [
  {
    id: 'standard',
    label: 'Standard Notice',
    desc: 'Professional two-week (or agreed) notice period.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  },
  {
    id: 'immediate',
    label: 'Immediate',
    desc: 'Leaving without notice. Direct and dignified.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
  },
  {
    id: 'retirement',
    label: 'Retirement',
    desc: 'End of a career chapter. Warm and reflective.',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
  },
];

const TONES = [
  { id: 'professional', label: 'Professional', desc: 'Clean and direct' },
  { id: 'warm', label: 'Warm', desc: 'Appreciative' },
  { id: 'brief', label: 'Brief', desc: 'Under 100 words' },
];

const LANGUAGES = ['English', 'Deutsch'];

export default function ResignPage() {
  const [type, setType] = useState('standard');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('English');
  const [form, setForm] = useState({
    yourName: '', managerName: '', company: '', role: '',
    lastDay: '', reason: '', highlights: '',
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
      const res = await fetch('/api/resign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, tone, language, ...form }),
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

  const fieldClass = 'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Resignation Letter Generator</h1>
          <p className="text-sm text-gray-500 mt-1">
            Leave on your own terms. Professional, specific, no bridges burned.
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
                <input type="text" value={form.yourName} onChange={set('yourName')} placeholder="Alex Johnson" className={fieldClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Manager&apos;s name</label>
                <input type="text" value={form.managerName} onChange={set('managerName')} placeholder="Sarah Chen" className={fieldClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company <span className="text-red-500">*</span></label>
                <input type="text" value={form.company} onChange={set('company')} required placeholder="Acme Corp" className={fieldClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your role</label>
                <input type="text" value={form.role} onChange={set('role')} placeholder="Senior Product Manager" className={fieldClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last working day
                  {type === 'immediate' && <span className="ml-1 text-xs text-gray-400">(today, or leave blank)</span>}
                </label>
                <input type="date" value={form.lastDay} onChange={set('lastDay')} className={fieldClass} />
              </div>
            </div>

            {type !== 'immediate' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Reason <span className="text-gray-400 font-normal text-xs">(optional — will be mentioned briefly if provided)</span>
                  </label>
                  <input type="text" value={form.reason} onChange={set('reason')} placeholder="Relocating / new opportunity / personal reasons" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Positive highlights <span className="text-gray-400 font-normal text-xs">(optional — what you&apos;ll take with you)</span>
                  </label>
                  <input type="text" value={form.highlights} onChange={set('highlights')} placeholder="e.g. The team, the challenges I worked on, what I learned here" className={fieldClass} />
                </div>
              </>
            )}

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <div className="flex gap-2 flex-wrap">
                {TONES.map((t) => (
                  <button key={t.id} type="button"
                    onClick={() => setTone(t.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition ${
                      tone === t.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}>
                    {t.label}
                    <span className={`text-xs ${tone === t.id ? 'text-indigo-200' : 'text-gray-400'}`}>— {t.desc}</span>
                  </button>
                ))}
              </div>
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

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
            >
              {isLoading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Writing…</>
              ) : 'Generate letter →'}
            </button>
          </form>
        </div>

        {/* Output */}
        {(output || isStreaming) && (
          <div className="mt-6 space-y-3">
            {!isStreaming && (
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Your resignation letter</h2>
                <button onClick={copy} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
                  {copied ? (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy letter</>
                  )}
                </button>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600" />
              <div className="px-6 sm:px-8 py-7 text-[15px] text-gray-800 leading-[1.9] whitespace-pre-wrap font-[system-ui]">
                {output}
                {isStreaming && <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />}
              </div>
            </div>
            {!isStreaming && (
              <p className="text-xs text-gray-400 text-center">Always read it before sending — fill in any [placeholder] fields.</p>
            )}
          </div>
        )}

        {/* Cross-sell */}
        {output && !isStreaming && (
          <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Starting your next chapter?</p>
              <p className="text-xs text-gray-500 mt-0.5">Generate a tailored cover letter for your next role — with job fit score, ATS check, and interview prep.</p>
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
