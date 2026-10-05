import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // With Fluid compute, always create a new client per request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value),
            );
          }
        },
      },
    },
  );

  // IMPORTANT: Do not add any code between createServerClient and
  // getClaims(). getClaims() is what triggers the token refresh.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Redirect unauthenticated users to /login for protected routes. Only the
  // app itself is listed: any other path is public, so an unknown URL reaches
  // the router and gets a real 404 instead of a redirect to the login page.
  // The API stays closed by default.
  const protectedPaths = [
    '/dashboard',
    '/essays',
    '/profile',
    '/settings',
    '/onboarding',
    '/api',
  ];
  const publicApiPaths = ['/api/auth', '/api/billing/webhook'];

  const { pathname } = request.nextUrl;
  const matches = (prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);

  const isProtected =
    protectedPaths.some(matches) && !publicApiPaths.some(matches);

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return supabaseResponse as-is to keep cookies in sync.
  return supabaseResponse;
}
