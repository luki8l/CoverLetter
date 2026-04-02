import { createClient } from '@supabase/supabase-js';

let _supabase = null;
let _supabaseAdmin = null;

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return _supabase;
}

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabaseAdmin;
}

// Named exports for convenience (lazy)
export const supabase = new Proxy({}, {
  get(_, prop) {
    return getSupabase()[prop];
  },
});

export const supabaseAdmin = new Proxy({}, {
  get(_, prop) {
    return getSupabaseAdmin()[prop];
  },
});
