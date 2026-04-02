import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">CoverDraft</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/cv"
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            CV Optimizer
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Pricing
          </Link>
          <Link
            href="/generate"
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition ml-1"
          >
            Try Free
          </Link>
        </div>
      </div>
    </nav>
  );
}
