'use client';

import { useState } from 'react';
import { addToTracker } from './ApplicationTracker';

export default function WhatsNext({ formData, onScrollToInterview, onToast }) {
  const [tracked, setTracked] = useState(false);

  function handleTrack() {
    const added = addToTracker({
      company: formData?.company,
      jobTitle: formData?.jobTitle,
    });
    setTracked(true);
    onToast?.(added ? 'Application tracked ✓' : 'Already tracked');
  }

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-1.5 flex-wrap">
      <span className="text-xs font-semibold text-gray-500 mr-1 whitespace-nowrap">What&apos;s next?</span>

      {/* Track */}
      <button
        type="button"
        onClick={handleTrack}
        disabled={tracked}
        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${
          tracked
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-indigo-300'
        }`}
      >
        {tracked ? (
          <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>Tracked</>
        ) : (
          <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>Track application</>
        )}
      </button>

      <span className="text-gray-200 text-xs">·</span>

      {/* Follow-up */}
      <a
        href={`/followup?company=${encodeURIComponent(formData?.company || '')}&role=${encodeURIComponent(formData?.jobTitle || '')}&type=follow-up`}
        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-indigo-300 transition"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Schedule follow-up
      </a>

      <span className="text-gray-200 text-xs">·</span>

      {/* Interview prep */}
      <button
        type="button"
        onClick={onScrollToInterview}
        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-indigo-300 transition"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Prep interview
      </button>

      <span className="text-gray-200 text-xs">·</span>

      {/* LinkedIn outreach */}
      <a
        href={`/linkedin?company=${encodeURIComponent(formData?.company || '')}&role=${encodeURIComponent(formData?.jobTitle || '')}`}
        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-indigo-300 transition"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Message recruiter
      </a>
    </div>
  );
}
