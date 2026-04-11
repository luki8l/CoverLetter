'use client';

import { useState, useEffect } from 'react';

const QUICK_CHIPS = [
  { id: 'longer',    label: 'Make it longer',        text: 'Make the letter longer — add more substance and depth, aim for 350+ words.' },
  { id: 'shorter',   label: 'Make it shorter',       text: 'Make the letter more concise — cut unnecessary sentences, aim for under 280 words.' },
  { id: 'formal',    label: 'More formal',            text: 'Adjust the tone to be more formal and professional.' },
  { id: 'casual',    label: 'More conversational',   text: 'Make the tone slightly warmer and more conversational — still professional, but less stiff.' },
  { id: 'opening',   label: 'Stronger opening',      text: 'Rewrite the opening paragraph with a more compelling, specific hook that immediately grabs attention.' },
  { id: 'closing',   label: 'Bolder closing',        text: 'Make the closing paragraph more confident and direct — clear call to action, no hedging.' },
  { id: 'specific',  label: 'More specific examples', text: 'Add more concrete, specific examples and results from the candidate\'s background.' },
  { id: 'confident', label: 'More confident voice',  text: 'Make the tone more confident throughout — less hedging, more assertive statements.' },
];

export default function RefinePanel({ formData, currentLetter, onRefined, onShowModal }) {
  const [selected, setSelected] = useState(new Set());
  const [freeText, setFreeText] = useState('');
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState('');

  // Listen for grade-improve events from LetterGrade component
  useEffect(() => {
    function onGradeImprove(e) {
      if (e.detail?.feedback) setFreeText(e.detail.feedback);
    }
    window.addEventListener('grade-improve', onGradeImprove);
    return () => window.removeEventListener('grade-improve', onGradeImprove);
  }, []);

  const { company, jobTitle, language } = formData || {};

  // Dynamic chips based on form data
  const dynamicChips = [
    company && {
      id: 'company',
      label: `Name "${company}" explicitly`,
      text: `Ensure the company name "${company}" appears naturally in the letter body — not just in the salutation.`,
    },
    jobTitle && {
      id: 'jobtitle',
      label: `Mention role "${jobTitle.split(' ').slice(0, 3).join(' ')}…"`,
      text: `Reference the exact job title "${jobTitle}" somewhere in the letter body.`,
    },
  ].filter(Boolean);

  const allChips = [...dynamicChips, ...QUICK_CHIPS];

  function toggleChip(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function buildFeedback() {
    const chipTexts = allChips
      .filter(c => selected.has(c.id))
      .map(c => `- ${c.text}`);
    const parts = [...chipTexts];
    if (freeText.trim()) parts.push(`- ${freeText.trim()}`);
    return parts.join('\n');
  }

  async function handleRefine() {
    const feedback = buildFeedback();
    if (!feedback) return;

    setRefining(true);
    setError('');

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLetter,
          feedback,
          jobTitle,
          company,
          language,
        }),
      });

      if (res.status === 429) {
        setRefining(false);
        onShowModal?.();
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        setRefining(false);
        return;
      }

      // Stream the refined version
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      onRefined('', true); // signal streaming started

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        onRefined(result, true);
      }

      onRefined(result, false);
      setSelected(new Set());
      setFreeText('');
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setRefining(false);
    }
  }

  const hasFeedback = selected.size > 0 || freeText.trim().length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Refine this draft</h3>
          <p className="text-xs text-gray-400">Select quick adjustments or describe what to change</p>
        </div>
      </div>

      {/* Quick chips */}
      <div className="flex flex-wrap gap-2">
        {allChips.map((chip) => {
          const active = selected.has(chip.id);
          const isDynamic = dynamicChips.some(c => c.id === chip.id);
          return (
            <button
              key={chip.id}
              onClick={() => toggleChip(chip.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active
                  ? isDynamic
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-indigo-100 border-indigo-300 text-indigo-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              {active && <span className="mr-1">✓</span>}
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Free text */}
      <div>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Anything specific? e.g. 'add that I speak German', 'remove the internship reference', 'mention my Python skills more prominently'…"
          rows={2}
          className="w-full text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Action */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {selected.size > 0 && `${selected.size} adjustment${selected.size > 1 ? 's' : ''} selected`}
          {selected.size > 0 && freeText.trim() && ' + custom note'}
          {selected.size === 0 && !freeText.trim() && 'Select adjustments above or type your note'}
        </p>
        <button
          onClick={handleRefine}
          disabled={!hasFeedback || refining}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            hasFeedback && !refining
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {refining ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refining…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Apply & Regenerate
            </>
          )}
        </button>
      </div>
    </div>
  );
}
