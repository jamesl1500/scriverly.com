import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import getStripe from '@/libs/stripe';
import { createSupabaseServiceClient } from '@/libs/supabase/server';

// Stripe requires the raw body for signature verification — disable body parsing
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[billing/webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error('[billing/webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const supabaseUserId = session.metadata?.supabase_user_id;
        if (!supabaseUserId || session.mode !== 'subscription') break;

        await supabase
          .from('profiles')
          .update({
            plan:                    'premium',
            stripe_customer_id:      session.customer as string,
            stripe_subscription_id:  session.subscription as string,
            plan_expires_at:         null,
          })
          .eq('user_id', supabaseUserId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from('profiles')
          .update({
            plan:                   'free',
            stripe_subscription_id: null,
            plan_expires_at:        null,
          })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'invoice.payment_failed': {
        // Grace period: mark plan_expires_at 3 days from now
        // Stripe will retry; if it ultimately fails, subscription.deleted fires
        const invoice = event.data.object as Stripe.Invoice;
        const subId   = typeof invoice.parent?.subscription_details?.subscription === 'string'
          ? invoice.parent.subscription_details.subscription
          : null;
        if (!subId) break;

        const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        await supabase
          .from('profiles')
          .update({ plan_expires_at: expiresAt })
          .eq('stripe_subscription_id', subId);
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }
  } catch (err) {
    console.error(`[billing/webhook] Error handling ${event.type}:`, err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
