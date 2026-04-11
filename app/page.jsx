import Link from 'next/link';
import Navbar from '@/components/Navbar';
import LeadCaptureSection from '@/components/LeadCaptureSection';
import { allPosts } from '@/lib/posts/index.js';

const TOOLS = [
  {
    id: 'cover-letter',
    href: '/generate',
    accentClass: 'bg-indigo-600',
    labelColor: 'text-indigo-300',
    label: 'Cover Letter Generator',
    title: 'Paste job post. Get letter.',
    desc: 'References actual JD requirements and your real background. Job fit score + ATS signal checker built in.',
    cta: 'Generate free →',
    ctaClass: 'bg-white text-indigo-600 hover:bg-indigo-50',
    plan: null,
    features: [
      'Auto-fill from job URL',
      'Streams in real time',
      'Job Fit Score (free) + Strategy tip (Pro)',
      'Interview prep — 2 free, 5 with Pro',
      'PDF & Word (.docx) export',
    ],
  },
  {
    id: 'followup',
    href: '/followup',
    accentClass: 'bg-violet-600',
    labelColor: 'text-violet-300',
    label: 'Follow-up Email Generator',
    title: 'The email that tips decisions.',
    desc: 'Application check-in, post-interview thank-you, rejection recovery. Specific, short, and human — in seconds.',
    cta: 'Write a follow-up →',
    ctaClass: 'bg-white text-violet-600 hover:bg-violet-50',
    plan: 'Free',
    features: [
      'Application follow-up (1 week after)',
      'Interview thank-you (sent same day)',
      'Rejection recovery — keep the door open',
      'Open in any email client instantly',
    ],
  },
  {
    id: 'cv',
    href: '/cv',
    accentClass: 'bg-gray-900',
    labelColor: 'text-gray-500',
    label: 'CV Optimizer',
    title: 'Raw notes in. ATS CV out.',
    desc: 'Paste anything — messy notes, old CV, LinkedIn. Get a clean, keyword-rich CV. Use it for your cover letter in one click.',
    cta: 'Optimize CV →',
    ctaClass: 'bg-white text-gray-900 hover:bg-gray-100',
    plan: null,
    features: [
      'Upload existing PDF to reformat',
      'ATS keyword optimization',
      'One-click: use as cover letter base',
      'PDF export',
    ],
  },
];

const MINI_TOOLS = [
  { href: '/linkedin', label: 'LinkedIn Message Generator', desc: 'Cold outreach, open role, connection request. Messages recruiters actually reply to.' },
  { href: '/resign',   label: 'Resignation Letter Generator', desc: 'Standard notice, immediate, or retirement. Professional and dignified.' },
  { href: '/followup', label: 'Follow-up Email Generator', desc: 'Thank-you, check-in, rejection recovery. The email that tips decisions.' },
];

const WORKFLOW_STEPS = [
  { num: '01', title: 'Paste the job URL', body: 'Auto-fills everything — title, company, description, and company context. No copy-paste.', badge: null },
  { num: '02', title: 'Check your fit', body: 'See your match score, strengths, gaps, and the exact angle to lead with — before writing a word.', badge: 'Free' },
  { num: '03', title: 'Get the letter', body: 'Watch it stream in real time. Specific to this role, this company, your actual background.', badge: null },
  { num: '04', title: 'Refine it', body: 'Longer, shorter, more formal, bolder opening — one click. Or write your own instruction.', badge: null },
  { num: '05', title: 'Prep for everything', body: 'Interview questions + answer frameworks. Follow-up email when the time comes. All in one place.', badge: null },
];

const TESTIMONIALS = [
  {
    quote: 'I got 5 interviews from 8 applications. The fit score told me exactly what to lead with for each company.',
    name: 'Markus H.',
    role: 'Software Engineer, Berlin',
  },
  {
    quote: 'The interview thank-you email I generated got a reply within an hour. I got the offer two days later.',
    name: 'Sophie R.',
    role: 'Product Manager, Vienna',
  },
  {
    quote: 'Every other generator gives you the same template garbage. This one actually reads the job description.',
    name: 'James T.',
    role: 'Marketing Lead, London',
  },
];

const COMPARISON = [
  { feature: 'Human-sounding output (no AI clichés)', us: true, them: false },
  { feature: 'Job Fit Score before you apply', us: true, them: false },
  { feature: 'Interview prep tied to your JD + CV', us: true, them: false },
  { feature: 'Post-interview thank-you email', us: true, them: false },
  { feature: 'Application tracker', us: true, them: false },
  { feature: 'PDF + Word export with proper letterhead', us: true, them: '~' },
  { feature: 'Refine with one click', us: true, them: false },
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CoverDraft',
    description: 'The complete AI job application toolkit — cover letter, CV, fit score, interview prep, and follow-up emails. Free to start.',
    url: process.env.NEXT_PUBLIC_APP_URL,
    applicationCategory: 'BusinessApplication',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />

        {/* ── Hero ────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center px-4 pt-20 pb-24 text-center overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-[0.13]"
            style={{ background: 'radial-gradient(ellipse at center, #818cf8 0%, transparent 70%)' }} />

          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Cover letter · Fit score · Interview prep · Follow-up emails
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight max-w-4xl mb-6">
              Every tool to{' '}
              <span className="text-indigo-600">land the interview</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl leading-relaxed mb-10">
              From job post to signed offer — CoverDraft handles the writing. Cover letter, CV, fit analysis, interview prep, follow-up emails. One platform, completely free to start.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
              <Link href="/generate"
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 w-full sm:w-auto text-center">
                Generate cover letter free →
              </Link>
              <Link href="/pricing"
                className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-base hover:bg-gray-50 transition border border-gray-200 w-full sm:w-auto text-center">
                See Pro — €9/mo
              </Link>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <p className="text-xs text-gray-400">No account needed · 1 letter/day free</p>
              <span className="text-gray-200 text-xs hidden sm:inline">·</span>
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-indigo-600">Sign up free</span> → 2 letters/day + save your work
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-100 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 text-center mb-3">How it works</p>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-14">The full application workflow, in one place</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
              {WORKFLOW_STEPS.map((step) => (
                <div key={step.num} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl font-black text-indigo-100 leading-none">{step.num}</span>
                    {step.badge && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">{step.badge}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3 Tools ─────────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 text-center mb-3">Four tools</p>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-14">Everything in one workflow</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {TOOLS.map((tool) => (
                <div key={tool.id} className={`${tool.accentClass} rounded-2xl p-7 text-white flex flex-col`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase tracking-widest ${tool.labelColor}`}>{tool.label}</span>
                    {tool.plan && (
                      <span className="text-xs font-semibold text-emerald-300 bg-emerald-400/20 border border-emerald-400/30 rounded-full px-2 py-0.5">{tool.plan}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2 mt-3">{tool.title}</h3>
                  <p className="text-sm opacity-80 leading-relaxed mb-5">{tool.desc}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {tool.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm opacity-80">
                        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={tool.href} className={`block text-center font-bold text-sm px-5 py-3 rounded-xl transition ${tool.ctaClass}`}>
                    {tool.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mini Tools ──────────────────────────────────────── */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center mb-6">More free tools</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {MINI_TOOLS.map((t) => (
                <Link key={t.href} href={t.href} className="group bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:bg-indigo-50/30 transition">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition mb-1.5">{t.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison table ────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-100 py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 text-center mb-3">vs. other tools</p>
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Why job seekers switch to CoverDraft</h2>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-3 text-xs font-bold text-gray-500 uppercase tracking-widest px-6 py-3 border-b border-gray-100 bg-gray-50">
                <span className="col-span-1">Feature</span>
                <span className="text-center text-indigo-700">CoverDraft</span>
                <span className="text-center">Others</span>
              </div>
              {COMPARISON.map((row, i) => (
                <div key={i} className={`grid grid-cols-3 items-center px-6 py-3.5 text-sm ${i % 2 === 0 ? '' : 'bg-gray-50/50'} border-b border-gray-100 last:border-0`}>
                  <span className="text-gray-700 col-span-1 pr-4">{row.feature}</span>
                  <span className="text-center">
                    {row.us === true && <svg className="w-5 h-5 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                  </span>
                  <span className="text-center">
                    {row.them === false && <svg className="w-5 h-5 text-red-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                    {row.them === true && <svg className="w-5 h-5 text-emerald-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                    {row.them === '~' && <span className="text-gray-400 text-xs font-medium">Partial</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-14">From people who got the interview</h2>
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

        {/* ── From the Blog ───────────────────────────────────── */}
        <section className="py-20 px-4 bg-gray-50 border-y border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">From the blog</p>
                <h2 className="text-3xl font-extrabold text-gray-900">Cover letter guides &amp; tips</h2>
              </div>
              <Link href="/blog" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition shrink-0 ml-4">
                All articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {allPosts.slice(0, 6).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-indigo-200 hover:shadow-sm transition flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-400">{post.readTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 leading-snug transition flex-1">
                    {post.titleTag || post.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-3 leading-relaxed line-clamp-2">{post.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Email lead capture ──────────────────────────────── */}
        <LeadCaptureSection />

        {/* ── Final CTA ───────────────────────────────────────── */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-indigo-600 rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20"
                style={{ background: 'radial-gradient(ellipse at 30% 50%, #a5b4fc 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, #818cf8 0%, transparent 60%)' }} />
              <div className="relative z-10">
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3">Free to start · Pro from €9/month</p>
                <h2 className="text-3xl font-extrabold text-white mb-4">Start with your next application</h2>
                <p className="text-indigo-200 text-base mb-8 max-w-lg mx-auto">
                  No account needed to try it. Create a free account and get 2 letters per day — or upgrade to Pro for the full toolkit, unlimited.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/generate"
                    className="inline-block bg-white text-indigo-600 font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition shadow-lg w-full sm:w-auto text-center">
                    Generate free →
                  </Link>
                  <Link href="/auth"
                    className="inline-block bg-white/20 text-white font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-white/30 transition border border-white/20 w-full sm:w-auto text-center">
                    Create free account
                  </Link>
                </div>
                <p className="text-indigo-300 text-xs mt-5">
                  Free account = 2 letters/day + saved history + application tracker
                </p>
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
