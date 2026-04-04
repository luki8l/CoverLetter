'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await getSupabase().auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-gray-500 hover:text-red-600 transition px-4 py-2 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50"
    >
      Sign out
    </button>
  );
}
