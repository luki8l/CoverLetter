import { NextResponse } from 'next/server';
import { createClient, getAdminClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ isPro: false, loggedIn: false });

    const admin = getAdminClient();
    const { data: byId } = await admin
      .from('subscribers')
      .select('is_pro')
      .eq('user_id', user.id)
      .single();
    if (byId) return NextResponse.json({ isPro: byId.is_pro || false, loggedIn: true });

    const { data: byEmail } = await admin
      .from('subscribers')
      .select('is_pro')
      .eq('email', user.email)
      .single();
    return NextResponse.json({ isPro: byEmail?.is_pro || false, loggedIn: true });
  } catch {
    return NextResponse.json({ isPro: false, loggedIn: false });
  }
}
