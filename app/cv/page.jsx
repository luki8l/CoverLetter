'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CVOptimizerForm from '@/components/CVOptimizerForm';
import UpgradeModal from '@/components/UpgradeModal';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

// ── CV section renderer ──────────────────────────────────────────────────────
function CVPreview({ text }) {
  const blocks = [];
  let currentSection = null;

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentSection) currentSection.lines.push('');
      continue;
    }
    // Section headers: all-caps, short
    if (/^[A-ZÄÖÜÉ\s]{4,}$/.test(trimmed) && trimmed.length < 35) {
      if (currentSection) blocks.push(currentSection);
      currentSection = { heading: trimmed, lines: [] };
    } else if (!currentSection) {
      // Name / contact header
      const header = blocks.find((b) => b.type === 'header');
      if (!header) blocks.push({ type: 'header', lines: [trimmed] });
      else header.lines.push(trimmed);
    } else {
      currentSection.lines.push(line);
    }
  }
  if (currentSection) blocks.push(currentSection);

  if (!blocks.length) {
    return <pre className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">{text}</pre>;
  }

  return (
    <div className="space-y-7 text-sm text-gray-800">
      {blocks.map((block, bi) => {
        if (block.type === 'header') {
          return (
            <div key={bi}>
              {block.lines.map((l, li) => (
                <div key={li} className={li === 0 ? 'text-2xl font-bold text-gray-900 tracking-tight' : 'text-gray-500 text-sm mt-0.5'}>{l}</div>
              ))}
            </div>
          );
        }
        const lines = block.lines.filter((l) => l !== '' || false);
        return (
          <div key={bi}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 shrink-0">{block.heading}</h3>
              <div className="flex-1 h-px bg-indigo-100" />
            </div>
            <div className="space-y-0.5">
              {lines.map((line, li) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={li} className="h-2" />;

                // Bullet
                if (trimmed.startsWith('-')) {
                  return (
                    <div key={li} className="flex items-start gap-2 ml-1">
                      <span className="text-indigo-400 text-xs mt-1.5 shrink-0">▸</span>
                      <span className="leading-relaxed text-gray-700">{trimmed.slice(1).trim()}</span>
                    </div>
                  );
                }
                // Role line (contains |)
                if (trimmed.includes('|')) {
                  const parts = trimmed.split('|').map((p) => p.trim());
                  return (
                    <div key={li} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-4 mb-1.5 pt-2 border-t border-gray-100 first:border-0 first:pt-0 first:mt-0">
                      <span className="font-semibold text-gray-900">{parts[0]}</span>
                      {parts[1] && <span className="text-gray-600 text-xs">· {parts[1]}</span>}
                      {parts[2] && <span className="text-gray-400 text-xs ml-auto">{parts[2]}</span>}
                    </div>
                  );
                }
                // Regular line
                return <div key={li} className="text-gray-600 leading-relaxed">{trimmed}</div>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Streaming placeholder ────────────────────────────────────────────────────
function StreamingCV({ text }) {
  return (
    <div className="px-8 py-8">
      <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{text}</pre>
      <span className="streaming-cursor" />
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function CVPage() {
  const router = useRouter();
  const { toasts, toast } = useToast();
  const [optimizedCV, setOptimizedCV] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [lastForm, setLastForm] = useState(null);
  const [copied, setCopied] = useState(false);

  async function optimize(formData) {
    setIsLoading(true);
    setIsStreaming(false);
    setError('');
    setOptimizedCV('');
    setLastForm(formData);

    try {
      const res = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.status === 429) { setIsLoading(false); setShowModal(true); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        setIsLoading(false);
        return;
      }

      setIsStreaming(true);
      setTimeout(() => document.getElementById('cv-output')?.scrollIntoView({ behavior: 'smooth' }), 150);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setOptimizedCV(result);
      }

      setIsStreaming(false);
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(optimizedCV);
    setCopied(true);
    toast('Copied to clipboard');
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

  function handlePrintCV() { window.print(); }

  function handleUseForcoverLetter() {
    // Save CV text to localStorage so /generate can pick it up
    try {
      const existing = JSON.parse(localStorage.getItem('coverdraft-form-v1') || '{}');
      localStorage.setItem('coverdraft-form-v1', JSON.stringify({ ...existing, background: optimizedCV }));
    } catch { /* ignore */ }
    router.push('/generate');
  }

  const wordCount = optimizedCV ? optimizedCV.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              ATS Optimizer
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CV Optimizer</h1>
          <p className="text-sm text-gray-500 mt-1">
            Paste anything — old CV, LinkedIn bio, brain dump. Get a clean, ATS-ready CV that sounds human.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: '1', text: 'Paste raw experience or upload PDF' },
            { step: '2', text: 'Add target role for keyword optimization' },
            { step: '3', text: 'Get ATS-ready CV + use it for your cover letter' },
          ].map((item) => (
            <div key={item.step} className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center mx-auto mb-2">{item.step}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <CVOptimizerForm onOptimize={optimize} isLoading={isLoading || isStreaming} />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div id="cv-output" />

        {(optimizedCV || isStreaming) && (
          <div className="mt-10 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Optimized CV</h2>
                {isStreaming ? (
                  <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    Writing…
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">{wordCount} words</span>
                )}
              </div>
              {!isStreaming && (
                <div className="flex items-center gap-2">
                  <button onClick={() => optimize(lastForm)} disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition">
                    <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                  </button>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    {copied
                      ? <><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                      : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                    }
                  </button>
                  <button onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    .txt
                  </button>
                  <button onClick={handlePrintCV}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print / PDF
                  </button>
                </div>
              )}
            </div>

            {/* CV card */}
            <div id="cv-print-area" className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-gray-700 via-gray-500 to-gray-600 print-hide" />
              {isStreaming
                ? <StreamingCV text={optimizedCV} />
                : <div className="px-8 py-8"><CVPreview text={optimizedCV} /></div>
              }
            </div>

            {/* Cross-tool CTA — only when done */}
            {!isStreaming && (
              <div className="p-5 bg-indigo-600 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Use this CV for your cover letter</p>
                  <p className="text-xs text-indigo-200 mt-0.5">One click — we pre-fill the background field automatically.</p>
                </div>
                <button
                  onClick={handleUseForcoverLetter}
                  className="shrink-0 bg-white text-indigo-600 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition whitespace-nowrap"
                >
                  Write Cover Letter →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center">
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} CoverDraft</p>
      </footer>

      {showModal && (
        <UpgradeModal onClose={() => setShowModal(false)} />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
