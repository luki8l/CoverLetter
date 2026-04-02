'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import CVOptimizerForm from '@/components/CVOptimizerForm';
import UpgradeModal from '@/components/UpgradeModal';

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

      if (res.status === 429) {
        setShowModal(true);
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setOptimizedCV(data.optimizedCV);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEmailUnlock(email) {
    setUnlockedEmail(email);
    setShowModal(false);
    if (lastForm) setTimeout(() => optimize({ ...lastForm }), 300);
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
    <div className="min-h-screen flex flex-col bg-white">
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
            Paste anything — messy notes, old CV, LinkedIn bio. Get back a clean, ATS-ready CV that still reads human.
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[
            { step: '1', text: 'Paste your raw experience in any format' },
            { step: '2', text: 'Add your target role for keyword optimization' },
            { step: '3', text: 'Get a structured CV that passes HR screening' },
          ].map((item) => (
            <div key={item.step} className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mx-auto mb-2">
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

        {/* Output */}
        {optimizedCV && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Optimized CV</h2>
              <span className="text-xs text-gray-400">{wordCount} words</span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <pre className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                {optimizedCV}
              </pre>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .txt
              </button>

              <button
                onClick={() => optimize(lastForm)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            </div>

            {/* CTA to cover letter */}
            <div className="mt-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Now write the cover letter</p>
                <p className="text-xs text-gray-500 mt-0.5">Use your optimized CV to generate a matching cover letter.</p>
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

      <footer className="border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>

      {showModal && (
        <UpgradeModal
          onClose={() => setShowModal(false)}
          onEmailSubmit={handleEmailUnlock}
        />
      )}
    </div>
  );
}
