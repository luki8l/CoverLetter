'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TRACKER_KEY = 'coverdraft-tracker';

const STATUSES = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

const STATUS_STYLES = {
  Applied:      { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  'Phone Screen': { bg: 'bg-violet-50', text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500' },
  Interview:    { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  Offer:        { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Rejected:     { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     dot: 'bg-red-400' },
  Withdrawn:    { bg: 'bg-gray-50',    text: 'text-gray-500',    border: 'border-gray-200',    dot: 'bg-gray-400' },
};

function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function StatusBadge({ status, onClick }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Applied;
  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to update status"
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border} hover:opacity-80 transition cursor-pointer`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </button>
  );
}

export function addToTracker({ company, jobTitle, letterId = null } = {}) {
  try {
    const existing = JSON.parse(localStorage.getItem(TRACKER_KEY) || '[]');
    // Avoid duplicate if same company+role applied within 1 hour
    const isDuplicate = existing.some(
      e => e.company === company && e.jobTitle === jobTitle &&
           (Date.now() - new Date(e.appliedDate).getTime()) < 3600000
    );
    if (isDuplicate) return false;
    const entry = {
      id: String(Date.now()),
      company: company || '',
      jobTitle: jobTitle || '',
      status: 'Applied',
      appliedDate: new Date().toISOString(),
      letterId,
      notes: '',
    };
    const updated = [entry, ...existing];
    localStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export default function ApplicationTracker() {
  const router = useRouter();
  const [apps, setApps] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(TRACKER_KEY) || '[]');
      setApps(stored);
    } catch {
      setApps([]);
    }
  }, []);

  function nextStatus(current) {
    const idx = STATUSES.indexOf(current);
    return STATUSES[(idx + 1) % STATUSES.length];
  }

  function updateStatus(id, newStatus) {
    const updated = apps.map(a => a.id === id ? { ...a, status: newStatus } : a);
    setApps(updated);
    localStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
  }

  function saveNote(id) {
    const updated = apps.map(a => a.id === id ? { ...a, notes: notes[id] ?? a.notes } : a);
    setApps(updated);
    localStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
  }

  function deleteApp(id) {
    const updated = apps.filter(a => a.id !== id);
    setApps(updated);
    localStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
    if (expandedId === id) setExpandedId(null);
  }

  function openLetter(app) {
    // Find matching letter in history and load it
    try {
      const history = JSON.parse(localStorage.getItem('coverdraft-history') || '[]');
      const entry = app.letterId
        ? history.find(h => h.id === app.letterId)
        : history.find(h => h.company === app.company && h.jobTitle === app.jobTitle);
      if (entry) {
        localStorage.setItem('coverdraft-load-letter', JSON.stringify(entry));
        router.push('/generate');
      } else {
        router.push('/generate');
      }
    } catch {
      router.push('/generate');
    }
  }

  if (!apps || apps.length === 0) return null;

  const active = apps.filter(a => !['Rejected', 'Withdrawn'].includes(a.status));
  const closed = apps.filter(a => ['Rejected', 'Withdrawn'].includes(a.status));

  function AppRow({ app }) {
    const isOpen = expandedId === app.id;
    return (
      <div className={`border-t border-gray-100 ${isOpen ? 'bg-gray-50' : ''}`}>
        <div
          className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition"
          onClick={() => setExpandedId(isOpen ? null : app.id)}
        >
          {/* Company initial */}
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
            {app.company?.[0]?.toUpperCase() || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{app.company}</p>
            <p className="text-xs text-gray-400 truncate">{app.jobTitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={app.status} onClick={(e) => { e.stopPropagation(); updateStatus(app.id, nextStatus(app.status)); }} />
            <span className="text-xs text-gray-300 hidden sm:inline">{timeAgo(app.appliedDate)}</span>
            <svg className={`w-4 h-4 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400">Applied {timeAgo(app.appliedDate)} · Click status badge to advance</p>

            {/* Status selector */}
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(s => {
                const st = STATUS_STYLES[s];
                return (
                  <button
                    key={s}
                    onClick={() => updateStatus(app.id, s)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition ${
                      app.status === s
                        ? `${st.bg} ${st.text} ${st.border} ring-2 ring-offset-1 ring-current`
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Notes */}
            <textarea
              value={notes[app.id] ?? app.notes}
              onChange={e => setNotes(n => ({ ...n, [app.id]: e.target.value }))}
              onBlur={() => saveNote(app.id)}
              rows={2}
              placeholder="Add notes (auto-saved on blur)…"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => openLetter(app)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View letter
              </button>
              <a
                href={`/followup?company=${encodeURIComponent(app.company)}&role=${encodeURIComponent(app.jobTitle)}&type=${app.status === 'Interview' ? 'thank-you' : 'follow-up'}`}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {app.status === 'Interview' ? 'Write thank-you →' : 'Write follow-up →'}
              </a>
              <button
                onClick={() => deleteApp(app.id)}
                className="ml-auto text-xs text-gray-300 hover:text-red-400 transition"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Applications</p>
        <span className="text-xs text-gray-300">{apps.length} tracked</span>
      </div>

      {active.length > 0 && (
        <div>
          {active.map(app => <AppRow key={app.id} app={app} />)}
        </div>
      )}

      {closed.length > 0 && (
        <div className="border-t border-gray-100">
          <p className="px-5 pt-3 pb-1 text-xs text-gray-300 font-medium">Closed</p>
          {closed.map(app => <AppRow key={app.id} app={app} />)}
        </div>
      )}
    </div>
  );
}
