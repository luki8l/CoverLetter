import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-server';

// Run in Supabase SQL editor to create the table:
// CREATE TABLE IF NOT EXISTS leads (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   email text NOT NULL,
//   source text DEFAULT 'landing',
//   created_at timestamptz DEFAULT now(),
//   UNIQUE(email)
// );
// CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);

export async function POST(request) {
  try {
    const { email, source = 'landing' } = await request.json();

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { error } = await admin
      .from('leads')
      .upsert(
        { email: email.toLowerCase().trim(), source },
        { onConflict: 'email', ignoreDuplicates: false }
      );

    if (error) {
      console.error('Lead upsert error:', error);
      // Still return ok — don't expose DB errors to frontend
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Lead capture error:', err);
    return NextResponse.json({ error: 'Failed. Please try again.' }, { status: 500 });
  }
}
