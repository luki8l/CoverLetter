import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient, getAdminClient } from '@/lib/supabase-server';
import SignOutButton from './SignOutButton';
import RecentLetters from '@/components/RecentLetters';

export const metadata = { title: 'My Account — CoverDraft' };

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth?redirect=/account');

  const admin = getAdminClient();

  // Check by user_id first, then email fallback
  let subscriber = null;
  const { data: byId } = await admin
    .from('subscribers')
    .select('is_pro, stripe_customer_id, created_at')
    .eq('user_id', user.id)
    .single();

  if (byId) {
    subscriber = byId;
  } else {
    const { data: byEmail } = await admin
      .from('subscribers')
      .select('is_pro, stripe_customer_id, created_at')
      .eq('email', user.email)
      .single();
    if (byEmail) {
      subscriber = byEmail;
      // Link user_id retroactively
      await admin
        .from('subscribers')
        .update({ user_id: user.id })
        .eq('email', user.email);
    }
  }

  const isPro = subscriber?.is_pro ?? false;

  // Today's usage
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [{ count: genCount }, { count: todayCount }] = await Promise.all([
    admin
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    admin
      .from('generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString()),
  ]);

  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="w-full border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm">CoverDraft</span>
          </Link>
          <SignOutButton />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-4 pb-2">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-extrabold text-indigo-600 shrink-0">
            {user.email?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{user.email}</h1>
            <p className="text-sm text-gray-400">Member since {memberSince}</p>
          </div>
        </div>

        {/* Plan card */}
        {isPro ? (
          <div className="rounded-2xl bg-indigo-600 text-white p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                  <span className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">Active</span>
                </div>
                <h2 className="text-3xl font-extrabold text-white">Pro Plan</h2>
                <p className="text-sm text-indigo-200 mt-1">Unlimited generations · All features unlocked</p>
              </div>
              <form action="/api/stripe/portal" method="POST">
                <button
                  type="submit"
                  className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg transition border border-white/20 whitespace-nowrap"
                >
                  Manage billing →
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Current plan</p>
                <h2 className="text-2xl font-extrabold text-gray-900">Free</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {todayCount > 0
                    ? "You've used today's free generation"
                    : '1 free generation available today'}
                </p>
              </div>
              <Link
                href="/pricing"
                className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
              >
                Upgrade to Pro →
              </Link>
            </div>
            {/* Free tier usage bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Today&apos;s usage</span>
                <span>{Math.min(todayCount, 1)}/1</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div
                  className={`h-1.5 rounded-full transition-all ${todayCount > 0 ? 'bg-red-400' : 'bg-indigo-400'}`}
                  style={{ width: todayCount > 0 ? '100%' : '0%' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">Total generations</p>
            <p className="text-4xl font-extrabold text-gray-900">{genCount ?? 0}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">Generated today</p>
            <p className="text-4xl font-extrabold text-gray-900">{todayCount ?? 0}</p>
          </div>
        </div>

        {/* Tools */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">Tools</p>
          <Link
            href="/generate"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition border-t border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Cover Letter Generator</p>
                <p className="text-xs text-gray-400">Write a tailored cover letter</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/cv"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition border-t border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">CV Optimizer</p>
                <p className="text-xs text-gray-400">Polish your CV for ATS</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Recent letters (reads localStorage on client) */}
        <RecentLetters />

        {/* Upgrade nudge for free users */}
        {!isPro && (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Go unlimited for €9/month</p>
              <p className="text-xs text-gray-500 mt-0.5">No daily limits. Generate as many letters as you need.</p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Upgrade
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
