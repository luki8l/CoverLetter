import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request) {
  try {
    const { email } = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${appUrl}/generate?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        email: email || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
