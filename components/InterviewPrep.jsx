'use client';

import { useState } from 'react';

const TYPE_COLORS = {
  Behavioral:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  Technical:    { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  Situational:  { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
  Motivation:   { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  Challenge:    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

function TypeBadge({ type }) {
  const c = TYPE_COLORS[type] || TYPE_COLORS.Behavioral;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {type}
    </span>
  );
}

function QuestionCard({ q, index, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border rounded-xl overflow-hidden transition-shadow ${open ? 'border-gray-300 shadow-sm' : 'border-gray-200'}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 leading-snug">{q.question}</p>
            {q.type && (
              <div className="mt-1.5">
                <TypeBadge type={q.type} />
              </div>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Why they ask */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 flex gap-2.5">
            <svg className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-amber-800 mb-0.5">Why they ask this</p>
              <p className="text-xs text-amber-700 leading-relaxed">{q.why}</p>
            </div>
          </div>

          {/* Answer framework */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest">How to answer</p>
            <ol className="space-y-2">
              {(q.framework || []).map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700 leading-snug">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

function PrepSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-4/5" />
            <div className="h-3 bg-gray-100 rounded w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

const FREE_QUESTIONS = 2;

export default function InterviewPrep({ data, isLoading, error, isPro, onGenerate }) {
  if (!data && !isLoading && !error) {
    return (
      <div className="mt-6 border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Interview Prep</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isPro ? '5 predicted questions — specific to this role and your background' : '2 free questions · 5 with Pro'}
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prep for Interview
          </button>
        </div>
      </div>
    );
  }

  const lockedQuestions = !isPro && data ? data.questions.slice(FREE_QUESTIONS) : [];

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-sm font-bold text-gray-900">Interview Prep</h3>
        {isPro
          ? <span className="ml-auto text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5 font-medium">Pro</span>
          : <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">2 / 5 free</span>
        }
      </div>

      {isLoading && <PrepSkeleton />}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={onGenerate} className="text-xs font-medium text-red-600 hover:text-red-800 underline whitespace-nowrap">
            Retry
          </button>
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-2">
          {/* Free questions (always visible) */}
          {data.questions.slice(0, isPro ? data.questions.length : FREE_QUESTIONS).map((q, i) => (
            <QuestionCard key={i} q={q} index={i} defaultOpen={i === 0} />
          ))}

          {/* Locked questions for free users */}
          {lockedQuestions.length > 0 && (
            <div className="relative mt-1">
              {/* Blurred question previews */}
              <div className="blur-[3px] select-none pointer-events-none space-y-2" aria-hidden="true">
                {lockedQuestions.map((q, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {FREE_QUESTIONS + i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{q.question}</p>
                      {q.type && <div className="mt-1.5"><TypeBadge type={q.type} /></div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upgrade overlay — gradient fade + CTA */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 bg-gradient-to-b from-transparent via-white/70 to-white rounded-b-xl">
                <div className="text-center px-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    +{lockedQuestions.length} more questions locked
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Includes Technical, Situational & Challenge questions with full answer frameworks
                  </p>
                  <a
                    href="/pricing"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Unlock all 5 — Upgrade to Pro
                  </a>
                </div>
              </div>
            </div>
          )}

          {isPro && (
            <p className="text-xs text-gray-400 text-center pt-2">
              Questions generated based on this job description and your background
            </p>
          )}
        </div>
      )}
    </div>
  );
}
