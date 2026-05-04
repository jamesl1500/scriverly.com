import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { errorResponse } from '@/libs/apiHelpers';
import { NextResponse } from 'next/server';
import getStripe from '@/libs/stripe';

export async function POST(_request: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return errorResponse('Server misconfiguration: NEXT_PUBLIC_APP_URL not set.', 500, 'misconfiguration');
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse('Unauthorized', 401, 'unauthorized');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return errorResponse('No billing account found.', 404, 'not_found');
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer:   profile.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('[billing/portal]', err);
    return errorResponse('Failed to open billing portal.', 500);
  }
}
