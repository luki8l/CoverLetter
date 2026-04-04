'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HISTORY_KEY = 'coverdraft-history';

function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function RecentLetters() {
  const router = useRouter();
  const [letters, setLetters] = useState(null); // null = loading

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      setLetters(stored);
    } catch {
      setLetters([]);
    }
  }, []);

  function openLetter(entry) {
    try {
      localStorage.setItem('coverdraft-load-letter', JSON.stringify(entry));
    } catch { /* ignore */ }
    router.push('/generate');
  }

  function deleteLetter(id, e) {
    e.stopPropagation();
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const updated = stored.filter((l) => l.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      setLetters(updated);
    } catch { /* ignore */ }
  }

  // Don't render if still checking or empty
  if (!letters || letters.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Recent letters</p>
        <span className="text-xs text-gray-300">{letters.length} saved locally</span>
      </div>

      <div>
        {letters.slice(0, 5).map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition border-t border-gray-100 cursor-pointer"
            onClick={() => openLetter(entry)}
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{entry.company || 'Untitled'}</p>
              <p className="text-xs text-gray-400 truncate">
                {entry.jobTitle || 'Unknown role'}
                {entry.matchData?.score != null && (
                  <span className={`ml-2 font-semibold ${
                    entry.matchData.score >= 70 ? 'text-indigo-500' :
                    entry.matchData.score >= 55 ? 'text-amber-500' : 'text-red-400'
                  }`}>
                    {entry.matchData.score}% match
                  </span>
                )}
              </p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-300">{timeAgo(entry.date)}</span>
              <span className="text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition">
                Open →
              </span>
              <button
                onClick={(e) => deleteLetter(entry.id, e)}
                className="opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-400 p-0.5 rounded"
                title="Remove from history"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {letters.length > 5 && (
        <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100 text-center">
          +{letters.length - 5} more saved in your browser
        </p>
      )}
    </div>
  );
}
