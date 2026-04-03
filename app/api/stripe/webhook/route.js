import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = getAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const customerId = session.customer;
        const email = session.customer_details?.email || session.customer_email;

        if (userId) {
          await admin
            .from('subscribers')
            .upsert(
              { user_id: userId, email: email || null, stripe_customer_id: customerId, is_pro: true },
              { onConflict: 'user_id' }
            );
        } else if (email) {
          // Fallback: no authenticated user at checkout time
          await admin
            .from('subscribers')
            .upsert(
              { email, stripe_customer_id: customerId, is_pro: true },
              { onConflict: 'email' }
            );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await admin
          .from('subscribers')
          .update({ is_pro: false })
          .eq('stripe_customer_id', subscription.customer);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const isActive = ['active', 'trialing'].includes(subscription.status);
        await admin
          .from('subscribers')
          .update({ is_pro: isActive })
          .eq('stripe_customer_id', subscription.customer);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
