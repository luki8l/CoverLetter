import Link from 'next/link';
import Navbar from '@/components/Navbar';

const COVER_LETTER_FEATURES = [
  'Paste job URL → auto-fills everything',
  'Upload your CV as PDF',
  'English & Deutsch',
  'Proper letterhead + Print as PDF',
  'ATS signal checker',
];

const CV_FEATURES = [
  'Paste any format — messy notes, old CV, LinkedIn',
  'Upload existing PDF to reformat',
  'Keyword-optimized for your target role',
  'One-click: use CV for cover letter',
  'Print-ready PDF output',
];

const HOW_IT_WORKS = [
  {
    num: '01',
    title: 'Paste the job URL',
    body: 'We fetch the posting automatically — job title, company, description, and company context. No copy-paste needed.',
  },
  {
    num: '02',
    title: 'Add your background',
    body: 'Paste your CV text or upload a PDF. The AI reads your actual experience — no generic filler.',
  },
  {
    num: '03',
    title: 'Get a letter worth sending',
    body: 'Watch it write in real time. Copy, download .txt, or print to PDF. Ready to submit in under a minute.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'I used CoverDraft for 8 applications. Got 5 interviews. The letters actually reference real things from the job post.',
    name: 'Markus H.',
    role: 'Software Engineer, Berlin',
  },
  {
    quote: 'The CV optimizer turned my messy bullet list into something I\'m actually proud to send.',
    name: 'Sophie R.',
    role: 'Product Manager, Vienna',
  },
  {
    quote: 'Tried three other generators. All produced the same template garbage. This one sounds like me.',
    name: 'James T.',
    role: 'Marketing Lead, London',
  },
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CoverDraft',
    description:
      'Free AI cover letter generator and CV optimizer. Personalized, ATS-friendly, and human-sounding — in under 60 seconds.',
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
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center px-4 pt-20 pb-24 text-center overflow-hidden">
          {/* Subtle radial glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse at center, #818cf8 0%, transparent 70%)' }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Powered by Claude AI · Streams in real time
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight max-w-4xl mb-6">
              Cover letters that{' '}
              <span className="text-indigo-600">don&apos;t sound like AI</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl leading-relaxed mb-10">
              Paste a job URL. Add your background. Watch the letter write itself in seconds —
              personalized, ATS-friendly, and human enough that nobody will know.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
              <Link
                href="/generate"
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 w-full sm:w-auto text-center"
              >
                Generate cover letter →
              </Link>
              <Link
                href="/cv"
                className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-50 transition border border-gray-200 w-full sm:w-auto text-center"
              >
                Optimize my CV
              </Link>
            </div>

            <p className="text-xs text-gray-400">
              Free · No account required · 1 generation/day
            </p>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-100 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 text-center mb-3">
              How it works
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-14">
              Job URL in. Submit-ready letter out.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.num} className="flex flex-col">
                  <span className="text-4xl font-black text-indigo-100 mb-4 leading-none">
                    {step.num}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Two tools ─────────────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 text-center mb-3">
              Two tools, one workflow
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-14">
              Optimize CV → generate letter → submit
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cover Letter card */}
              <div className="bg-indigo-600 rounded-2xl p-7 text-white flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Cover Letter Generator</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Paste job post. Get letter.</h3>
                <p className="text-sm text-indigo-100 leading-relaxed mb-6">
                  References actual details from the job description. Proper letterhead, ATS signals checked, print to PDF in one click.
                </p>
                <ul className="space-y-2 mb-8 flex-1">
                  {COVER_LETTER_FEATURES.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-indigo-100">
                      <svg className="w-3.5 h-3.5 text-indigo-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/generate"
                  className="block text-center bg-white text-indigo-600 font-bold text-sm px-5 py-3 rounded-xl hover:bg-indigo-50 transition"
                >
                  Generate for free →
                </Link>
              </div>

              {/* CV Optimizer card */}
              <div className="bg-gray-900 rounded-2xl p-7 text-white flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">CV Optimizer</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Raw notes in. ATS CV out.</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Paste anything unstructured. Get a clean, keyword-rich CV — then use it for your cover letter in one click.
                </p>
                <ul className="space-y-2 mb-8 flex-1">
                  {CV_FEATURES.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="w-3.5 h-3.5 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cv"
                  className="block text-center bg-white text-gray-900 font-bold text-sm px-5 py-3 rounded-xl hover:bg-gray-100 transition"
                >
                  Optimize CV →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── What makes it different ───────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-100 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 text-center mb-3">
              Not like other generators
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-14">
              The difference is in the output
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  ),
                  title: 'No banned phrases',
                  body: '20+ AI-tell phrases blocked at prompt level. No "I am passionate about", "fast-paced environment", "results-driven", or "I look forward to hearing from you."',
                },
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  ),
                  title: 'Specific, not generic',
                  body: 'References actual requirements from the job post and actual experience from your background — not template placeholders.',
                },
                {
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ),
                  title: 'ATS-optimized by default',
                  body: 'Keywords from the job description land in context — in sentences, not stuffed into a list. The signal bar confirms before you send.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.icon}
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-14">
              From people who got interviews
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, si) => (
                      <svg key={si} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-indigo-600 rounded-3xl p-12">
              <h2 className="text-3xl font-extrabold text-white mb-4">
                Start with one free letter
              </h2>
              <p className="text-indigo-200 text-base mb-8">
                No account. No credit card. See the output before you decide anything.
              </p>
              <Link
                href="/generate"
                className="inline-block bg-white text-indigo-600 font-bold text-base px-10 py-4 rounded-xl hover:bg-indigo-50 transition shadow-lg"
              >
                Generate for free →
              </Link>
              <p className="text-indigo-300 text-xs mt-5">
                1 free per day · Upgrade to Pro for unlimited
              </p>
            </div>
          </div>
        </section>

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
