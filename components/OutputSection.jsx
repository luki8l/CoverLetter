'use client';

import { useState } from 'react';
import { downloadCoverLetterPDF, downloadCoverLetterDOCX } from '@/lib/export';

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
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;

  // Company: exact match OR any significant word from the name (ignores AG, GmbH, Ltd…)
  const GENERIC_WORDS = new Set(['bank', 'group', 'international', 'global', 'gmbh', 'inc', 'ltd', 'ag', 'se', 'sa', 'bv', 'nv', 'and', 'the', 'of', 'for']);
  const hasCompany = company && (() => {
    if (lower.includes(company.toLowerCase())) return true;
    const significantWords = company.toLowerCase().split(/[\s,.\-&]+/).filter(w => w.length > 3 && !GENERIC_WORDS.has(w));
    return significantWords.length > 0 && significantWords.some(w => lower.includes(w));
  })();

  const hasJobTitle = jobTitle && lower.includes(jobTitle.toLowerCase().split(' ')[0]);
  const noGenericOpening = !/(i am writing to apply|to whom it may concern)/i.test(text);
  const underWordLimit = words <= 380;
  return { words, hasCompany, hasJobTitle, noGenericOpening, underWordLimit };
}

function Paragraph({ text, onCopy }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative group">
      <p className="leading-[1.85] text-gray-800">{text}</p>
      <button
        onClick={handleCopy}
        className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-md px-2 py-0.5 text-xs text-gray-500 hover:text-gray-800 shadow-sm"
        title="Copy paragraph"
      >
        {copied ? '✓' : 'copy'}
      </button>
    </div>
  );
}

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
  const [exporting, setExporting] = useState('');

  if (!coverLetter && !isStreaming) return null;

  const { senderName, senderCity, company, jobTitle, language } = formData || {};
  const paragraphs = parseParagraphs(coverLetter);
  const date = formatDate(language);
  const signals = getSignals(coverLetter, jobTitle, company);

  const exportPayload = { paragraphs, senderName, senderCity, date, company, jobTitle, language };

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

  async function handlePDF() {
    setExporting('pdf');
    try {
      await downloadCoverLetterPDF(exportPayload);
      onToast?.('PDF downloaded');
    } catch (e) {
      console.error(e);
      onToast?.('PDF export failed');
    } finally {
      setExporting('');
    }
  }

  async function handleDOCX() {
    setExporting('docx');
    try {
      await downloadCoverLetterDOCX(exportPayload);
      onToast?.('Word file downloaded');
    } catch (e) {
      console.error(e);
      onToast?.('DOCX export failed');
    } finally {
      setExporting('');
    }
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

            <button onClick={handleDOCX} disabled={exporting === 'docx'}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition">
              {exporting === 'docx'
                ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Exporting…</>
                : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>.docx</>
              }
            </button>

            <button onClick={handlePDF} disabled={exporting === 'pdf'}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">
              {exporting === 'pdf'
                ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Exporting…</>
                : <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>PDF</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Letter preview card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-400" />

        {isStreaming ? (
          <StreamingPreview text={coverLetter} />
        ) : (
          <div className="px-10 py-10 max-w-2xl font-[Georgia,serif]">
            {/* Letterhead */}
            <div className="mb-10 flex justify-between items-start">
              <div className="space-y-0.5">
                {senderName && <div className="text-sm font-semibold text-gray-900 font-sans">{senderName}</div>}
                {senderCity && <div className="text-sm text-gray-500 font-sans">{senderCity}</div>}
              </div>
              <div className="text-sm text-gray-400 text-right font-sans">{date}</div>
            </div>

            {/* Recipient */}
            {company && (
              <div className="mb-8 font-sans">
                <div className="text-sm font-semibold text-gray-700">{company}</div>
                {jobTitle && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {language === 'Deutsch' ? 'Betr.: Bewerbung als' : 'Re:'} {jobTitle}
                  </div>
                )}
              </div>
            )}

            {/* Thin rule */}
            <div className="border-t border-gray-100 mb-7" />

            {/* Body */}
            <div className="space-y-5 text-[15px]">
              {paragraphs.map((para, i) => (
                <Paragraph key={i} text={para} onCopy={() => onToast?.('Paragraph copied')} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ATS signals */}
      {!isStreaming && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              label: signals.underWordLimit ? `${signals.words} words ✓` : `${signals.words} words — trim`,
              ok: signals.underWordLimit,
              tip: signals.underWordLimit ? null : 'Most hiring managers prefer under 380 words. Consider cutting a paragraph.',
            },
            {
              label: 'Company referenced',
              ok: signals.hasCompany,
              tip: signals.hasCompany ? null : `The company name "${company || ''}" wasn't found. ATS systems score higher when the employer's name appears naturally in the body.`,
            },
            {
              label: 'No generic opener',
              ok: signals.noGenericOpening,
              tip: signals.noGenericOpening ? null : 'Avoid openers like "I am writing to apply…" — ATS and recruiters both flag these.',
            },
            {
              label: 'Role keyword',
              ok: signals.hasJobTitle,
              tip: signals.hasJobTitle ? null : `The job title "${(jobTitle || '').split(' ')[0]}" wasn't detected. Mentioning the exact role title improves ATS ranking.`,
            },
          ].map((s, i) => (
            <div key={i} className={`relative group flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-default ${s.ok ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {s.ok
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                }
              </svg>
              <span>{s.label}</span>
              {s.tip && (
                <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed">
                  {s.tip}
                  <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
