'use client';

import { useState, useEffect } from 'react';

const CIRC = 2 * Math.PI * 36; // 226.2

function ScoreRing({ score }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDisplayed(score), 80);
    return () => clearTimeout(t);
  }, [score]);

  const color =
    score >= 85 ? '#10b981' :
    score >= 70 ? '#6366f1' :
    score >= 55 ? '#f59e0b' : '#ef4444';

  const label =
    score >= 85 ? 'Strong fit' :
    score >= 70 ? 'Good fit' :
    score >= 55 ? 'Possible fit' : 'Weak fit';

  const dash = (displayed / 100) * CIRC;

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <svg width="96" height="96" viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r="36" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        {/* Fill */}
        <circle
          cx="50" cy="50" r="36"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRC}`}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Score number */}
        <text
          x="50" y="47"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight="700"
          fill={color}
          fontFamily="sans-serif"
        >
          {displayed}
        </text>
        {/* /100 */}
        <text
          x="50" y="63"
          textAnchor="middle"
          fontSize="9"
          fill="#9ca3af"
          fontFamily="sans-serif"
        >
          / 100
        </text>
      </svg>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function MatchSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />
      <div className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
            <div className="h-3 bg-gray-100 rounded w-3/5" />
            <div className="h-3 bg-gray-100 rounded w-2/3 mt-4" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
          </div>
        </div>
        <div className="mt-5 h-16 bg-indigo-50 rounded-xl" />
      </div>
    </div>
  );
}

export default function MatchCard({ data, isLoading, error, onRetry }) {
  if (isLoading) return <MatchSkeleton />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-red-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
        {onRetry && (
          <button onClick={onRetry} className="text-xs font-medium text-red-600 hover:text-red-800 underline whitespace-nowrap">
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400" />
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-sm font-bold text-gray-900">Job Fit Analysis</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">Free</span>
        </div>

        {/* Score + strengths/gaps */}
        <div className="flex items-start gap-5 sm:gap-6">
          <ScoreRing score={data.score} />

          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Strengths</p>
              <ul className="space-y-2">
                {data.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-snug">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Gaps / Watch-outs</p>
              <ul className="space-y-2">
                {data.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-snug">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <svg className="w-2.5 h-2.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                      </svg>
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Strategy tip */}
        <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex gap-3">
          <svg className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-indigo-800 mb-0.5">Letter strategy</p>
            <p className="text-sm text-indigo-700 leading-relaxed">{data.angle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
