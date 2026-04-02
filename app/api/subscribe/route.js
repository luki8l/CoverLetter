import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('subscribers')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Failed to save email' }, { status: 500 });
  }
}
