'use client';

import { useState } from 'react';

function formatDate(language) {
  const now = new Date();
  if (language === 'Deutsch') {
    return now.toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Parse the letter into sections for beautiful rendering
function parseLetter(text) {
  const lines = text.split('\n').map((l) => l.trim());
  const paragraphs = [];
  let current = '';

  for (const line of lines) {
    if (line === '') {
      if (current.trim()) {
        paragraphs.push(current.trim());
        current = '';
      }
    } else {
      current += (current ? ' ' : '') + line;
    }
  }
  if (current.trim()) paragraphs.push(current.trim());

  return paragraphs;
}

// Rough ATS signal checks
function getSignals(text, jobTitle, company) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const hasCompany = company && text.toLowerCase().includes(company.toLowerCase());
  const hasJobTitle = jobTitle && text.toLowerCase().includes(jobTitle.toLowerCase().split(' ')[0]);
  const noGenericOpening = !/(i am writing to apply|to whom it may concern)/i.test(text);
  const underWordLimit = words <= 380;

  return { words, hasCompany, hasJobTitle, noGenericOpening, underWordLimit };
}

export default function OutputSection({ coverLetter, onRegenerate, isLoading, formData }) {
  const [copied, setCopied] = useState(false);

  if (!coverLetter) return null;

  const { senderName, senderCity, company, jobTitle, language } = formData || {};
  const paragraphs = parseLetter(coverLetter);
  const date = formatDate(language);
  const signals = getSignals(coverLetter, jobTitle, company);

  async function handleCopy() {
    // Build a clean formatted plain-text version
    const parts = [];
    if (senderName || senderCity) {
      if (senderName) parts.push(senderName);
      if (senderCity) parts.push(senderCity);
    }
    parts.push(date);
    parts.push('');
    if (company) { parts.push(company); parts.push(''); }
    parts.push(coverLetter);
    await navigator.clipboard.writeText(parts.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    const parts = [];
    if (senderName) parts.push(senderName);
    if (senderCity) parts.push(senderCity);
    parts.push(date);
    parts.push('');
    if (company) { parts.push(company); parts.push(''); }
    parts.push(coverLetter);
    const blob = new Blob([parts.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${(company || 'output').toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-10 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-gray-900">Cover Letter</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRegenerate}
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
            {copied ? (
              <><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
            )}
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
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / PDF
          </button>
        </div>
      </div>

      {/* ── Letter preview ─────────────────────────────────── */}
      <div
        id="letter-print-area"
        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-400" />

        <div className="px-10 py-10 max-w-2xl">
          {/* Letterhead */}
          <div className="mb-10 flex justify-between items-start">
            <div className="space-y-0.5">
              {senderName && (
                <div className="text-sm font-semibold text-gray-900">{senderName}</div>
              )}
              {senderCity && (
                <div className="text-sm text-gray-500">{senderCity}</div>
              )}
            </div>
            <div className="text-sm text-gray-400 text-right">{date}</div>
          </div>

          {/* Recipient */}
          {company && (
            <div className="mb-8">
              <div className="text-sm font-semibold text-gray-700">{company}</div>
              {jobTitle && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {language === 'Deutsch' ? 'Betr.: Bewerbung als' : 'Re: Application for'} {jobTitle}
                </div>
              )}
            </div>
          )}

          {/* Letter body */}
          <div className="space-y-5 text-[15px] leading-[1.8] text-gray-800 font-[350]">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* ── ATS signals ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        {[
          { label: `${signals.words} words`, ok: signals.underWordLimit, note: signals.underWordLimit ? 'Good length' : 'A bit long' },
          { label: 'Company referenced', ok: signals.hasCompany },
          { label: 'No generic opener', ok: signals.noGenericOpening },
          { label: 'Role keyword', ok: signals.hasJobTitle },
        ].map((s, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${s.ok ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {s.ok
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
            <span>{s.note || s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
