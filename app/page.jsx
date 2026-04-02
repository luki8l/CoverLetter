import Link from 'next/link';
import Navbar from '@/components/Navbar';

const features = [
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Generated in seconds',
    description: 'Paste the job description, describe your background — done. No templates, no manual editing.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'ATS-friendly',
    description: 'Structured to pass applicant tracking systems, with keywords pulled straight from the job post.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    title: 'Truly personalized',
    description: 'Not a fill-in-the-blank template. Every letter references the actual role and your specific experience.',
  },
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CoverDraft',
    description: 'Free AI cover letter generator. Personalized, ATS-friendly cover letters in 30 seconds.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Powered by Claude AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl mb-6">
            Write the perfect cover letter in{' '}
            <span className="text-indigo-600">30 seconds</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mb-10">
            AI-powered, personalized, ATS-friendly. Paste the job post, describe your experience,
            and get a compelling cover letter instantly.
          </p>

          <Link
            href="/generate"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            Generate for free →
          </Link>

          <p className="text-xs text-gray-400 mt-4">No sign-up required · 1 free generation per day</p>

          {/* Features */}
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full text-left">
            {features.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Social proof nudge */}
          <div className="mt-16 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['bg-indigo-400', 'bg-purple-400', 'bg-pink-400', 'bg-amber-400'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white`} />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">2,400+ professionals</span> generated their cover letter this week
            </p>
          </div>
        </main>

        <footer className="border-t border-gray-100 py-8 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} CoverDraft ·{' '}
            <Link href="/pricing" className="hover:text-gray-600 transition">Pricing</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
