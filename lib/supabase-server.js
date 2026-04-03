import { createServerClient } from '@supabase/ssr';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client — reads/writes auth cookies automatically.
 * Use in Server Components, API Route handlers, and Server Actions.
 */
export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try { cookieStore.set({ name, value, ...options }); } catch { /* read-only context */ }
        },
        remove(name, options) {
          try { cookieStore.set({ name, value: '', ...options }); } catch { /* read-only context */ }
        },
      },
    }
  );
}

/**
 * Admin client — bypasses RLS. Server-side only.
 * Lazy singleton so env vars are read at runtime, not module load.
 */
let _admin = null;
export function getAdminClient() {
  if (!_admin) {
    _admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _admin;
}
