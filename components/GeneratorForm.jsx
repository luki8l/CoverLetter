'use client';

import { useState, useRef } from 'react';
import JobUrlInput from './JobUrlInput';

const TONES = ['Professional', 'Enthusiastic', 'Creative'];
const LANGUAGES = ['English', 'Deutsch'];

export default function GeneratorForm({ onGenerate, isLoading }) {
  const [form, setForm] = useState({
    jobTitle: '',
    company: '',
    jobDescription: '',
    background: '',
    tone: 'Professional',
    language: 'English',
    senderName: '',
    senderCity: '',
  });
  const [companyContext, setCompanyContext] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [pdfStatus, setPdfStatus] = useState('');
  const [pdfError, setPdfError] = useState('');
  const fileRef = useRef(null);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  // Called when job URL is auto-filled
  function handleJobFilled(data) {
    setForm((prev) => ({
      ...prev,
      jobTitle: data.jobTitle || prev.jobTitle,
      company: data.company || prev.company,
      jobDescription: data.jobDescription || prev.jobDescription,
    }));
    if (data.companyContext) setCompanyContext(data.companyContext);
    if (data.location) setJobLocation(data.location);
  }

  async function handlePdfUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfError('');
    setPdfStatus('Reading PDF…');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((prev) => ({ ...prev, background: data.text }));
      setPdfStatus(`Loaded: ${file.name}`);
    } catch (err) {
      setPdfError(err.message);
      setPdfStatus('');
    } finally {
      e.target.value = '';
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate({ ...form, companyContext, jobLocation });
  }

  const fieldClass =
    'w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Job URL ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label className="text-sm font-medium text-gray-700">Job URL</label>
          <span className="text-xs text-gray-400 font-normal">— paste a link to auto-fill everything below</span>
        </div>
        <JobUrlInput onFilled={handleJobFilled} />
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Job details ──────────────────────────────────────── */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Job Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.jobTitle}
              onChange={set('jobTitle')}
              required
              placeholder="e.g. Senior Product Manager"
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.company}
              onChange={set('company')}
              required
              placeholder="e.g. Stripe"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              Job Description <span className="text-red-500">*</span>
            </label>
            {jobLocation && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {jobLocation}
              </span>
            )}
          </div>
          <textarea
            value={form.jobDescription}
            onChange={set('jobDescription')}
            required
            rows={7}
            placeholder="Paste the job posting here, or use the URL auto-fill above…"
            className={`${fieldClass} resize-none`}
          />
        </div>

        {companyContext && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-800 mb-1">Company context (auto-extracted)</p>
                <p className="text-xs text-blue-700 leading-relaxed">{companyContext}</p>
                <button
                  type="button"
                  onClick={() => setCompanyContext('')}
                  className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Your background ──────────────────────────────────── */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Your Background</p>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              CV / Experience <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload PDF
            </button>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
          </div>

          {pdfStatus && (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {pdfStatus}
            </p>
          )}
          {pdfError && (
            <p className="mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pdfError}</p>
          )}

          <textarea
            value={form.background}
            onChange={set('background')}
            required
            rows={7}
            placeholder={`Paste your CV, LinkedIn bio, or describe your experience…\n\nTip: the more specific detail you give (companies, roles, results, technologies), the stronger the letter.`}
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your Name
              <span className="ml-1 text-gray-400 font-normal text-xs">(for the letterhead)</span>
            </label>
            <input
              type="text"
              value={form.senderName}
              onChange={set('senderName')}
              placeholder="e.g. Max Mustermann"
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Your City
              <span className="ml-1 text-gray-400 font-normal text-xs">(for the letterhead)</span>
            </label>
            <input
              type="text"
              value={form.senderCity}
              onChange={set('senderCity')}
              placeholder="e.g. Vienna, Austria"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* ── Style ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Style</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <div className="flex gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, tone: t }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition ${
                    form.tone === t
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, language: l }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition ${
                    form.language === l
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
            Writing your letter…
          </>
        ) : (
          'Generate Cover Letter →'
        )}
      </button>
    </form>
  );
}
