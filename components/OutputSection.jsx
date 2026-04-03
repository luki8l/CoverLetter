'use client';

import { useState } from 'react';

function formatDate(language) {
  const now = new Date();
  if (language === 'Deutsch') {
    return now.toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function parseParagraphs(text) {
  const paras = [];
  let current = '';
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') {
      if (current.trim()) { paras.push(current.trim()); current = ''; }
    } else {
      current += (current ? ' ' : '') + trimmed;
    }
  }
  if (current.trim()) paras.push(current.trim());
  return paras;
}

function getSignals(text, jobTitle, company) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const hasCompany = company && text.toLowerCase().includes(company.toLowerCase());
  const hasJobTitle = jobTitle && text.toLowerCase().includes(jobTitle.toLowerCase().split(' ')[0]);
  const noGenericOpening = !/(i am writing to apply|to whom it may concern)/i.test(text);
  const underWordLimit = words <= 380;
  return { words, hasCompany, hasJobTitle, noGenericOpening, underWordLimit };
}

// Individual paragraph — shows copy button on hover
function Paragraph({ text, onCopy }) {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="leading-[1.85] text-gray-800">{text}</p>
      {hovered && (
        <button
          onClick={handleCopy}
          className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md px-2 py-0.5 text-xs text-gray-500 hover:text-gray-800 shadow-sm"
          title="Copy paragraph"
        >
          {copied ? '✓' : 'copy'}
        </button>
      )}
    </div>
  );
}

// Streaming skeleton — text typing in with blinking cursor
function StreamingPreview({ text }) {
  const paragraphs = parseParagraphs(text);
  return (
    <div className="px-10 py-10 max-w-2xl">
      <div className="space-y-5 text-[15px]">
        {paragraphs.map((p, i) => (
          <p key={i} className="leading-[1.85] text-gray-800">{p}</p>
        ))}
        <span className="streaming-cursor" />
      </div>
    </div>
  );
}

export default function OutputSection({ coverLetter, isStreaming, onRegenerate, isLoading, formData, onToast }) {
  const [copied, setCopied] = useState(false);

  if (!coverLetter && !isStreaming) return null;

  const { senderName, senderCity, company, jobTitle, language } = formData || {};
  const paragraphs = parseParagraphs(coverLetter);
  const date = formatDate(language);
  const signals = getSignals(coverLetter, jobTitle, company);

  async function handleCopyAll() {
    const parts = [];
    if (senderName) parts.push(senderName);
    if (senderCity) parts.push(senderCity);
    parts.push(date);
    parts.push('');
    if (company) { parts.push(company); parts.push(''); }
    parts.push(coverLetter);
    await navigator.clipboard.writeText(parts.join('\n'));
    setCopied(true);
    onToast?.('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() { window.print(); }

  function handleDownload() {
    const parts = [];
    if (senderName) parts.push(senderName);
    if (senderCity) parts.push(senderCity);
    parts.push(date);
    if (company) { parts.push(''); parts.push(company); }
    parts.push('');
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
      {/* Action bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">Cover Letter</h2>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Writing…
            </span>
          )}
        </div>
        {!isStreaming && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onRegenerate} disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition">
              <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
            <button onClick={handleCopyAll}
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
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / PDF
            </button>
          </div>
        )}
      </div>

      {/* Letter card */}
      <div id="letter-print-area" className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-400 print-hide" />

        {isStreaming ? (
          <StreamingPreview text={coverLetter} />
        ) : (
          <div className="px-10 py-10 max-w-2xl">
            {/* Letterhead */}
            <div className="mb-10 flex justify-between items-start">
              <div className="space-y-0.5">
                {senderName && <div className="text-sm font-semibold text-gray-900">{senderName}</div>}
                {senderCity && <div className="text-sm text-gray-500">{senderCity}</div>}
              </div>
              <div className="text-sm text-gray-400 text-right">{date}</div>
            </div>

            {/* Recipient */}
            {company && (
              <div className="mb-8">
                <div className="text-sm font-semibold text-gray-700">{company}</div>
                {jobTitle && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {language === 'Deutsch' ? 'Betr.: Bewerbung als' : 'Re:'} {jobTitle}
                  </div>
                )}
              </div>
            )}

            {/* Body — each paragraph has its own copy button */}
            <div className="space-y-5 text-[15px]">
              {paragraphs.map((para, i) => (
                <Paragraph
                  key={i}
                  text={para}
                  onCopy={() => onToast?.('Paragraph copied')}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ATS signals — only when done */}
      {!isStreaming && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: `${signals.words} words`, ok: signals.underWordLimit, note: signals.underWordLimit ? `${signals.words} words ✓` : `${signals.words} words — trim` },
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
      )}
    </div>
  );
}
