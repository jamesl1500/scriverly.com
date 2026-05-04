import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { errorResponse } from '@/libs/apiHelpers';
import { NextResponse } from 'next/server';
import getStripe from '@/libs/stripe';

export async function POST(_request: NextRequest) {
  try {
    if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
      return errorResponse('Billing is not configured.', 500, 'misconfiguration');
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return errorResponse('Server misconfiguration: NEXT_PUBLIC_APP_URL not set.', 500, 'misconfiguration');
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    // Fetch or create the Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan')
      .eq('user_id', user.id)
      .single();

    if (profile?.plan === 'premium') {
      return errorResponse('You already have a Premium subscription.', 400, 'already_premium');
    }

    let customerId = profile?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', user.id);
    }

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/settings?billing=success`,
      cancel_url:  `${appUrl}/settings?billing=cancelled`,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (err) {
    console.error('[billing/checkout]', err);
    return errorResponse('Failed to start checkout.', 500);
  }
}
