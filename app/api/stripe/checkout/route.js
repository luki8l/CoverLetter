import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: user?.email || undefined,
      client_reference_id: user?.id || undefined,
      success_url: `${appUrl}/generate?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        user_id: user?.id || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
