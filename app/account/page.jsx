import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient, getAdminClient } from '@/lib/supabase-server';
import SignOutButton from './SignOutButton';

export const metadata = { title: 'My Account — CoverDraft' };

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth?redirect=/account');

  // Fetch subscription status
  const admin = getAdminClient();
  const { data: subscriber } = await admin
    .from('subscribers')
    .select('is_pro, stripe_customer_id, created_at')
    .eq('user_id', user.id)
    .single();

  const isPro = subscriber?.is_pro ?? false;

  // Count lifetime generations
  const { count: genCount } = await admin
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal nav */}
      <nav className="w-full border-b border-gray-100 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-sm">CoverDraft</span>
          </Link>
          <Link href="/generate" className="text-sm text-gray-500 hover:text-gray-800 transition">
            ← Back to generator
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500 mt-1">{user.email}</p>
        </div>

        {/* Plan card */}
        <div className={`rounded-2xl p-6 border ${isPro ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isPro ? 'text-indigo-200' : 'text-gray-400'}`}>
                Current plan
              </p>
              <div className="flex items-center gap-3">
                <h2 className={`text-2xl font-extrabold ${isPro ? 'text-white' : 'text-gray-900'}`}>
                  {isPro ? 'Pro' : 'Free'}
                </h2>
                {isPro && (
                  <span className="bg-indigo-500 text-indigo-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className={`text-sm mt-1 ${isPro ? 'text-indigo-200' : 'text-gray-500'}`}>
                {isPro
                  ? 'Unlimited generations · PDF download · Priority processing'
                  : '1 free generation per day'}
              </p>
            </div>
            {isPro ? (
              <form action="/api/stripe/portal" method="POST">
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition whitespace-nowrap"
                >
                  Manage billing →
                </button>
              </form>
            ) : (
              <Link
                href="/pricing"
                className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
              >
                Upgrade to Pro →
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">Generations</p>
            <p className="text-3xl font-extrabold text-gray-900">{genCount ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">lifetime total</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">Member since</p>
            <p className="text-xl font-bold text-gray-900">
              {new Date(user.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </p>
            <p className="text-xs text-gray-400 mt-1">{user.email}</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <Link href="/generate"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition rounded-t-2xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Cover Letter Generator</p>
              <p className="text-xs text-gray-400">Generate a new cover letter</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/cv"
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
            <div>
              <p className="text-sm font-medium text-gray-900">CV Optimizer</p>
              <p className="text-xs text-gray-400">Optimize your CV for ATS</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          {!isPro && (
            <Link href="/pricing"
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition rounded-b-2xl">
              <div>
                <p className="text-sm font-medium text-indigo-600">Upgrade to Pro</p>
                <p className="text-xs text-gray-400">Unlimited · €9/month</p>
              </div>
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Sign out */}
        <div className="flex justify-end">
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
