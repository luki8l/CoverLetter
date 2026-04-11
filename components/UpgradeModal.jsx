'use client';

const PRO_BULLETS = [
  'Unlimited cover letters — no daily cap',
  'Letter Strategy tip — the exact angle to lead with',
  'All 5 interview questions + answer frameworks',
  'Unlimited CV optimizations',
];

export default function UpgradeModal({ onClose, isAnonymous = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-400" />

        <div className="p-8">
          <button onClick={onClose}
            className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition"
            aria-label="Close">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {isAnonymous ? (
              <>
                <h3 className="text-xl font-bold text-gray-900">You&apos;ve used today&apos;s free letter</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Create a free account for <strong className="text-gray-700">2 letters/day</strong>, saved history, and application tracking — or upgrade to Pro for unlimited.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900">Daily limit reached</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  You&apos;ve used both free letters today. Upgrade to Pro and never see this screen again.
                </p>
              </>
            )}
          </div>

          {/* Pro benefits */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-5 space-y-1.5">
            {PRO_BULLETS.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-indigo-800">
                <svg className="w-3.5 h-3.5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {b}
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            <a href="/pricing"
              className="block w-full bg-indigo-600 text-white text-center py-3.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-200">
              Upgrade to Pro — €9/month →
              <span className="block text-xs text-indigo-200 font-normal mt-0.5">Cancel anytime · Most users land an interview in 2 weeks</span>
            </a>

            {isAnonymous ? (
              <a href="/auth"
                className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
                Create free account
                <span className="block text-xs text-gray-400 font-normal mt-0.5">2 letters/day · Saved history · Application tracker</span>
              </a>
            ) : (
              <button onClick={onClose}
                className="block w-full text-center py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition">
                Wait until tomorrow
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
