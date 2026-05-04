/**
 * server.ts
 * -----------------
 * This file defines a function to create a Supabase client instance that can be used in server-side contexts, such as API routes or server components.
 * It uses the `createServerClient` function from the `@supabase/ssr` package, which is designed for server-side rendering scenarios and handles cookies appropriately.
 * 
 * The `createSupabaseServerClient` function can be imported and called in any server-side module that needs to interact with the Supabase backend, providing a consistent way to access the database and authentication features while ensuring that cookies are managed correctly.
 * 
 * @module src/libs/supabase/server
 * @author James Latten
 * @created 2026-04-29
 * @version 1.0.0
 */
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Cookies can't be set inside Server Components — safe to ignore
            // when called from read-only contexts.
          }
        },
      },
    },
  );
}

/**
 * Service-role client — bypasses RLS.
 * Use ONLY in trusted server contexts (webhooks, cron jobs, migrations).
 * Never expose to the client or use in user-facing API routes.
 */
export function createSupabaseServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
