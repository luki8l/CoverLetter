import Link from 'next/link';
import Navbar from '@/components/Navbar';

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Paste the job URL',
    body: 'Auto-fills job title, company, description, and pulls company context from the web. No copy-paste needed.',
    badge: null,
  },
  {
    num: '02',
    title: 'Analyze your fit',
    body: 'See your match score (0–100), specific strengths and gaps against the JD, and a strategy angle before you write a word.',
    badge: 'Free',
  },
  {
    num: '03',
    title: 'Get the letter',
    body: 'Watch it stream in real time — specific to this company, this role, your actual background. No filler sentences.',
    badge: null,
  },
  {
    num: '04',
    title: 'Refine it',
    body: 'Make it longer, shorter, more formal, bolder opening — one click. Or type your own instruction.',
    badge: null,
  },
  {
    num: '05',
    title: 'Prep for the interview',
    body: '5 predicted questions based on the JD and your background — with frameworks for how to answer each one.',
    badge: 'Free preview',
  },
];

const POWER_FEATURES = [
  {
    label: 'Job Fit Score',
    plan: 'Free',
    planColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Match score, specific strengths, and honest gaps — before you invest time writing.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
  {
    label: 'Letter Strategy',
    plan: 'Pro',
    planColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    description: 'The exact angle to lead with for this specific role — based on the JD vs your background.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    ),
  },
  {
    label: 'Interview Prep',
    plan: '2 free · 5 with Pro',
    planColor: 'text-amber-700 bg-amber-50 border-amber-200',
    description: '5 predicted questions — specific to the JD and your CV — with "why they ask" and answer frameworks.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    label: 'Human-sounding output',
    plan: 'Always',
    planColor: 'text-gray-600 bg-gray-50 border-gray-200',
    description: '20+ AI-cliché phrases blocked at prompt level. Reads like you wrote it — because it references your actual background.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    ),
  },
  {
    label: 'ATS-ready by default',
    plan: 'Always',
    planColor: 'text-gray-600 bg-gray-50 border-gray-200',
    description: 'Company name, job title, and role keywords land in context — in sentences, not a stuffed list.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    label: 'PDF & Word export',
    plan: 'Always',
    planColor: 'text-gray-600 bg-gray-50 border-gray-200',
    description: 'Download a properly formatted A4 PDF or editable .docx — letterhead included, ready to attach.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    ),
  },
];

const TESTIMONIALS = [
  {
    quote: 'I used CoverDraft for 8 applications. Got 5 interviews. The letters actually reference real things from the job post.',
    name: 'Markus H.',
    role: 'Software Engineer, Berlin',
  },
  {
    quote: 'The fit score told me I was a 71% match and exactly what to lead with. The letter felt like I actually knew what I was doing.',
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
      'AI cover letter generator with job fit scoring and interview prep. Personalized, ATS-friendly, and human-sounding — in under 60 seconds.',
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
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-[0.15]"
            style={{ background: 'radial-gradient(ellipse at center, #818cf8 0%, transparent 70%)' }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Cover letter · Fit score · Interview prep — one flow
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight max-w-4xl mb-6">
              From job post to{' '}
              <span className="text-indigo-600">interview-ready</span>
              {' '}in minutes
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl leading-relaxed mb-10">
              Paste a job URL. See your fit score. Get a human-sounding cover letter.
              Then prep for the interview — all without switching tabs.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
              <Link
                href="/generate"
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 w-full sm:w-auto text-center"
              >
                Try it free →
              </Link>
              <Link
                href="/pricing"
                className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-50 transition border border-gray-200 w-full sm:w-auto text-center"
              >
                See Pro features
              </Link>
            </div>

            <p className="text-xs text-gray-400">
              Free · No account required · 1 letter/day
            </p>
          </div>
        </section>

        {/* ── How it works (5 steps) ────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-100 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 text-center mb-3">
              How it works
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-14">
              The full application workflow, automated
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.num} className="flex flex-col relative">
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="hidden sm:block absolute top-5 left-[calc(100%+0px)] w-full h-px bg-gray-200 -translate-y-1/2 z-0" style={{ left: '100%', width: 'calc(100% - 2rem)' }} />
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl font-black text-indigo-100 leading-none">{step.num}</span>
                    {step.badge && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Power features grid ───────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 text-center mb-3">
              What you get
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4">
              Not just a letter generator
            </h2>
            <p className="text-gray-500 text-center max-w-xl mx-auto mb-14">
              Every tool you need from first click to offer — fit analysis, letter, refinement, and interview prep in one place.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {POWER_FEATURES.map((f, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {f.icon}
                      </svg>
                    </div>
                    <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${f.planColor}`}>
                      {f.plan}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1.5">{f.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-100 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-14">
              From people who got interviews
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
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

        {/* ── Pro upgrade CTA ───────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-indigo-600 rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{ background: 'radial-gradient(ellipse at 30% 50%, #a5b4fc 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #818cf8 0%, transparent 60%)' }}
              />
              <div className="relative z-10">
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Pro plan · €9/month</p>
                <h2 className="text-3xl font-extrabold text-white mb-4">
                  Unlock the full workflow
                </h2>
                <p className="text-indigo-200 text-base mb-3 max-w-lg mx-auto">
                  Unlimited letters · Full fit strategy · All 5 interview questions · PDF + Word export
                </p>
                <p className="text-indigo-300 text-sm mb-8">
                  Cancel anytime. Most users land an interview within 2 weeks.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/generate"
                    className="inline-block bg-white/20 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/30 transition border border-white/20 w-full sm:w-auto"
                  >
                    Start free first
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-block bg-white text-indigo-600 font-bold text-sm px-8 py-3 rounded-xl hover:bg-indigo-50 transition shadow-lg w-full sm:w-auto"
                  >
                    Upgrade to Pro →
                  </Link>
                </div>
              </div>
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
