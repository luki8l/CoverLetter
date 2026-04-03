'use client';

export default function UpgradeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Daily limit reached</h3>
          <p className="text-sm text-gray-500 mt-2">
            You&apos;ve used your free generation for today. Upgrade to Pro for unlimited access.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="/pricing"
            className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            Upgrade to Pro — €9/month
            <span className="block text-xs text-indigo-200 font-normal mt-0.5">
              Unlimited generations · PDF export · Priority processing
            </span>
          </a>

          <a
            href="/auth"
            className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
          >
            Sign in to your account
            <span className="block text-xs text-gray-400 font-normal mt-0.5">
              Already a Pro subscriber? Sign in to unlock
            </span>
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Free plan: 1 generation per day
        </p>
      </div>
    </div>
  );
}
