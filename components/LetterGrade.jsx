'use client';

import { useState } from 'react';

const VERDICT_CONFIG = {
  'Exceptional': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-400', bar: 'bg-emerald-500' },
  'Strong':      { color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  ring: 'ring-indigo-400',  bar: 'bg-indigo-500'  },
  'Good':        { color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    ring: 'ring-blue-400',    bar: 'bg-blue-500'    },
  'Decent':      { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   ring: 'ring-amber-400',   bar: 'bg-amber-500'   },
  'Needs Work':  { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     ring: 'ring-red-400',     bar: 'bg-red-500'     },
};

function ScoreBar({ label, score, max, barColor }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-500 w-10 text-right">{score}/{max}</span>
    </div>
  );
}

export default function LetterGrade({ coverLetter, jobDescription, jobTitle, company, onImprove }) {
  const [grading, setGrading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [graded, setGraded] = useState(false);

  async function grade() {
    setGrading(true);
    setError('');
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverLetter, jobDescription, jobTitle, company }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Grading failed');
      setData(json);
      setGraded(true);
    } catch (err) {
      setError(err.message || 'Could not grade. Please try again.');
    } finally {
      setGrading(false);
    }
  }

  const cfg = data ? (VERDICT_CONFIG[data.verdict] || VERDICT_CONFIG['Decent']) : null;

  if (!graded) {
    return (
      <div className="mt-4 border border-dashed border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm font-semibold text-gray-900">Grade my letter</span>
          <span className="text-xs text-gray-400">— see how a recruiter would score it</span>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          onClick={grade}
          disabled={grading}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
        >
          {grading ? (
            <><svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Grading…</>
          ) : 'Grade it →'}
        </button>
      </div>
    );
  }

  return (
    <div className={`mt-4 rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Cover Letter Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-black ${cfg.color}`}>{data.total}</span>
            <span className="text-lg font-semibold text-gray-400">/100</span>
            <span className={`text-sm font-bold ml-1 ${cfg.color}`}>{data.verdict}</span>
          </div>
        </div>
        <button
          onClick={() => { setGraded(false); setData(null); }}
          className="text-xs text-gray-400 hover:text-gray-600 transition mt-1"
        >
          Re-grade
        </button>
      </div>

      {/* Score bars */}
      <div className="px-5 pb-4 space-y-2.5">
        <ScoreBar label="Opening Hook"  score={data.hook}        max={20} barColor={cfg.bar} />
        <ScoreBar label="Specificity"   score={data.specificity} max={25} barColor={cfg.bar} />
        <ScoreBar label="ATS Alignment" score={data.atsMatch}    max={25} barColor={cfg.bar} />
        <ScoreBar label="Conciseness"   score={data.conciseness} max={15} barColor={cfg.bar} />
        <ScoreBar label="Persuasion"    score={data.persuasion}  max={15} barColor={cfg.bar} />
      </div>

      {/* Tips */}
      {data.tips?.length > 0 && (
        <div className="border-t border-dashed border-current/10 mx-5 pt-4 pb-4 space-y-1.5" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">To improve</p>
          {data.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5 shrink-0">→</span>
              <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* Improve CTA */}
      {data.tips?.length > 0 && onImprove && (
        <div className="px-5 pb-5">
          <button
            onClick={() => onImprove(data.tips)}
            className="w-full text-center text-xs font-semibold py-2.5 px-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-700 transition text-gray-700"
          >
            Apply these improvements with AI →
          </button>
        </div>
      )}
    </div>
  );
}
