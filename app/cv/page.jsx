'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import CVOptimizerForm from '@/components/CVOptimizerForm';
import UpgradeModal from '@/components/UpgradeModal';

function CVPreview({ text }) {
  const lines = text.split('\n');
  const sections = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Section headers: all-caps lines like SUMMARY, EXPERIENCE, SKILLS, EDUCATION
    if (/^[A-ZÄÖÜ\s]{4,}$/.test(trimmed) && trimmed.length < 30) {
      if (current) sections.push(current);
      current = { type: 'section', heading: trimmed, lines: [] };
    } else if (!current) {
      // Name / contact block at the top
      if (!sections.length) {
        const header = sections.find((s) => s.type === 'header');
        if (!header) {
          sections.push({ type: 'header', lines: [trimmed] });
        } else {
          header.lines.push(trimmed);
        }
      }
    } else {
      current.lines.push(trimmed);
    }
  }
  if (current) sections.push(current);

  // If parsing found nothing meaningful, fall back to plain pre
  if (!sections.length || (sections.length === 1 && sections[0].type === 'header')) {
    return (
      <pre className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
        {text}
      </pre>
    );
  }

  return (
    <div className="space-y-6 text-sm text-gray-800">
      {sections.map((section, si) => {
        if (section.type === 'header') {
          return (
            <div key={si}>
              {section.lines.map((l, li) => (
                <div key={li} className={li === 0 ? 'text-xl font-bold text-gray-900' : 'text-gray-500 text-sm'}>{l}</div>
              ))}
            </div>
          );
        }

        const bodyLines = section.lines.filter((l) => l.trim());

        return (
          <div key={si}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600">{section.heading}</h3>
              <div className="flex-1 h-px bg-indigo-100" />
            </div>
            <div className="space-y-1.5">
              {bodyLines.map((line, li) => {
                if (line.startsWith('-')) {
                  return (
                    <div key={li} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1 text-xs shrink-0">▸</span>
                      <span className="leading-relaxed">{line.slice(1).trim()}</span>
                    </div>
                  );
                }
                // Company / role lines (contain |)
                if (line.includes('|')) {
                  const parts = line.split('|').map((p) => p.trim());
                  return (
                    <div key={li} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-3 mb-1">
                      {parts.map((part, pi) => (
                        <span key={pi} className={pi === 0 ? 'font-semibold text-gray-900' : pi === 1 ? 'text-gray-700' : 'text-gray-400 text-xs'}>
                          {pi > 0 && <span className="mr-3 text-gray-300">·</span>}
                          {part}
                        </span>
                      ))}
                    </div>
                  );
                }
                return <div key={li} className="leading-relaxed text-gray-600">{line}</div>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function CVPage() {
  const [optimizedCV, setOptimizedCV] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [unlockedEmail, setUnlockedEmail] = useState('');
  const [lastForm, setLastForm] = useState(null);
  const [copied, setCopied] = useState(false);

  async function optimize(formData) {
    setIsLoading(true);
    setError('');
    setLastForm(formData);

    try {
      const res = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: unlockedEmail || undefined }),
      });
      const data = await res.json();

      if (res.status === 429) { setShowModal(true); return; }
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }

      setOptimizedCV(data.optimizedCV);
      setTimeout(() => document.getElementById('cv-output')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(optimizedCV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([optimizedCV], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-optimized.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  const wordCount = optimizedCV ? optimizedCV.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              ATS Optimizer
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CV Optimizer</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paste anything — old CV, LinkedIn bio, brain dump. Get a clean, ATS-ready CV that still sounds human.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: '1', text: 'Paste raw experience in any format or upload PDF' },
            { step: '2', text: 'Add your target role for keyword optimization' },
            { step: '3', text: 'Get a structured, submission-ready CV' },
          ].map((item) => (
            <div key={item.step} className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center mx-auto mb-2">
                {item.step}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <CVOptimizerForm onOptimize={optimize} isLoading={isLoading} />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div id="cv-output" />

        {optimizedCV && (
          <div className="mt-10 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Optimized CV</h2>
                <p className="text-xs text-gray-400 mt-0.5">{wordCount} words · ready to paste into any application</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => optimize(lastForm)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  {copied
                    ? <><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                    : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                  }
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  .txt
                </button>
              </div>
            </div>

            {/* CV card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500" />
              <div className="px-8 py-8">
                <CVPreview text={optimizedCV} />
              </div>
            </div>

            {/* CTA → cover letter */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Now write the cover letter</p>
                <p className="text-xs text-gray-500 mt-0.5">Copy your optimized CV above and paste it into the cover letter generator.</p>
              </div>
              <a
                href="/generate"
                className="shrink-0 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Generate →
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>

      {showModal && (
        <UpgradeModal onClose={() => setShowModal(false)} onEmailSubmit={(email) => {
          setUnlockedEmail(email);
          setShowModal(false);
          if (lastForm) setTimeout(() => optimize(lastForm), 300);
        }} />
      )}
    </div>
  );
}
