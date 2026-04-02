'use client';

import { useState, useRef } from 'react';

const LANGUAGES = ['English', 'Deutsch'];

export default function CVOptimizerForm({ onOptimize, isLoading }) {
  const [rawText, setRawText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [language, setLanguage] = useState('English');
  const [pdfStatus, setPdfStatus] = useState('');
  const [pdfError, setPdfError] = useState('');
  const fileRef = useRef(null);

  async function handlePdfUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfError('');
    setPdfStatus('Extracting text from PDF...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to parse PDF');

      setRawText(data.text);
      setPdfStatus(`Extracted from ${file.name}`);
    } catch (err) {
      setPdfError(err.message);
      setPdfStatus('');
    } finally {
      // Reset input so same file can be re-uploaded
      e.target.value = '';
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onOptimize({ rawText, targetRole, targetIndustry, language });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Raw CV input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Your CV / Background <span className="text-red-500">*</span>
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
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handlePdfUpload}
          />
        </div>

        {pdfStatus && (
          <div className="mb-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {pdfStatus}
          </div>
        )}
        {pdfError && (
          <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {pdfError}
          </div>
        )}

        <textarea
          name="rawText"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          required
          rows={10}
          placeholder={`Paste anything — your old CV, LinkedIn bio, bullet points, a brain dump of your experience. The messier the input, the more the optimizer does.

Example:
worked at google 2019-2022 as software engineer, did backend stuff mainly python, led migration of legacy service to microservices, team of 5, before that did internship at startup...`}
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          Unstructured is fine — dates, job titles, skills, achievements in any order.
        </p>
      </div>

      {/* Target role + industry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Target Role
            <span className="ml-1 text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Product Manager, Data Engineer"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <p className="mt-1 text-xs text-gray-400">Used to add relevant ATS keywords.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Industry
            <span className="ml-1 text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={targetIndustry}
            onChange={(e) => setTargetIndustry(e.target.value)}
            placeholder="e.g. FinTech, Healthcare, SaaS"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Output Language</label>
        <div className="flex gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLanguage(l)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                language === l
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Optimizing...
          </>
        ) : (
          'Optimize CV'
        )}
      </button>
    </form>
  );
}
