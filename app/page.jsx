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
    description: 'Paste the job post, describe your background — done. No templates, no manual editing.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Passes ATS screening',
    description: "Keywords pulled from the job post, structured to score well in automated HR tools — without sounding like it.",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    title: "Doesn't read like AI",
    description: 'Specific, varied, human-sounding. Not a template with your name swapped in.',
  },
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CoverDraft',
    description: 'Free AI cover letter generator and CV optimizer. ATS-friendly, personalized in 30 seconds.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 flex flex-col items-center px-4 py-20 text-center">
          {/* Hero */}
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Powered by Claude AI
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl mb-6">
            Write the perfect cover letter in{' '}
            <span className="text-indigo-600">30 seconds</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mb-10">
            AI-powered, personalized, ATS-friendly. Not a template — a letter that
            references the actual role and your specific experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <Link
              href="/generate"
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Generate cover letter →
            </Link>
            <Link
              href="/cv"
              className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-50 transition border border-gray-200"
            >
              Optimize my CV
            </Link>
          </div>

          <p className="text-xs text-gray-400">No sign-up required · 1 free per day</p>

          {/* Two-tool callout */}
          <div className="mt-16 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-600 rounded-2xl p-6 text-left text-white">
              <div className="text-sm font-semibold text-indigo-200 mb-2 uppercase tracking-wide">Cover Letter Generator</div>
              <h2 className="text-xl font-bold mb-2">Paste job post. Get letter.</h2>
              <p className="text-sm text-indigo-100 mb-5 leading-relaxed">
                Paste the job description and your background. Choose a tone.
                Get a letter that references actual details from the role — not filler.
              </p>
              <ul className="space-y-1.5 text-sm text-indigo-100 mb-6">
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> Upload your CV as PDF</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> English or Deutsch</li>
                <li className="flex items-center gap-2"><span className="text-indigo-300">✓</span> 3 tone options</li>
              </ul>
              <Link
                href="/generate"
                className="inline-block bg-white text-indigo-600 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-50 transition"
              >
                Generate for free →
              </Link>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 text-left text-white">
              <div className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">CV Optimizer</div>
              <h2 className="text-xl font-bold mb-2">Raw notes in. Clean CV out.</h2>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Paste anything — old CV, LinkedIn bio, messy notes. Specify your target role.
                Get a structured, ATS-ready CV that still sounds like a human wrote it.
              </p>
              <ul className="space-y-1.5 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Upload existing CV as PDF</li>
                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Keyword-optimized for your target role</li>
                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Doesn&apos;t read like AI</li>
              </ul>
              <Link
                href="/cv"
                className="inline-block bg-white text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition"
              >
                Optimize CV →
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full text-left">
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

          {/* Social proof */}
          <div className="mt-16 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['bg-indigo-400', 'bg-purple-400', 'bg-pink-400', 'bg-amber-400'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white`} />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">2,400+ professionals</span> used CoverDraft this week
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
