'use client';

import { useState } from 'react';

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
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="jobTitle"
            value={form.jobTitle}
            onChange={handleChange}
            required
            placeholder="e.g. Senior Product Manager"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            placeholder="e.g. Stripe"
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Job Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="jobDescription"
          value={form.jobDescription}
          onChange={handleChange}
          required
          rows={6}
          placeholder="Paste the job posting here..."
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Background <span className="text-red-500">*</span>
        </label>
        <textarea
          name="background"
          value={form.background}
          onChange={handleChange}
          required
          rows={6}
          placeholder="Paste your CV or describe your experience, skills, and achievements..."
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
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
            Generating...
          </>
        ) : (
          'Generate Cover Letter'
        )}
      </button>
    </form>
  );
}
