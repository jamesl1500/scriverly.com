import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

const DEFAULT_REDIRECT = '/onboarding';
const RECOVERY_REDIRECT = '/reset_password';
const EMAIL_OTP_TYPES: EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email',
  'email_change',
];

function isEmailOtpType(type: string | null): type is EmailOtpType {
  if (!type) {
    return false;
  }

  return EMAIL_OTP_TYPES.includes(type as EmailOtpType);
}

function getSafeRedirectPath(next: string | null): string {
  if (!next) {
    return DEFAULT_REDIRECT;
  }

  // Allow only same-origin, root-relative paths to prevent open redirects.
  if (!next.startsWith('/') || next.startsWith('//')) {
    return DEFAULT_REDIRECT;
  }

  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = getSafeRedirectPath(searchParams.get('next'));

  const supabase = await createSupabaseServerClient();

  // Password recovery emails must always land on the reset page
  const isRecovery = type === 'recovery';
  const redirectTarget = isRecovery
    ? RECOVERY_REDIRECT
    : getSafeRedirectPath(next);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
  }

  if (tokenHash && isEmailOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
  }

  // If auth callback methods fail but a session already exists, proceed.
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  if (!code && !(tokenHash && isEmailOtpType(type))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(loginUrl);
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('error', 'verification_failed');
  return NextResponse.redirect(loginUrl);
}
