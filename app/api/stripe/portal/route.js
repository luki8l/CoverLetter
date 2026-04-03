import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient, getAdminClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL('/auth?redirect=/account', request.url));
    }

    const admin = getAdminClient();
    const { data: subscriber } = await admin
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscriber?.stripe_customer_id) {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const session = await stripe.billingPortal.sessions.create({
      customer: subscriber.stripe_customer_id,
      return_url: `${appUrl}/account`,
    });

    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error('Stripe portal error:', err);
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 });
  }
}
