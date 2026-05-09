import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/libs/supabase/server';

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();

    const response = NextResponse.redirect(
      new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
      { status: 303 },
    );

    return response;
  } catch {
    return NextResponse.redirect(
      new URL('/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
      { status: 303 },
    );
  }
}
