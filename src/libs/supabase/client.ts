/**
 * client.ts
 * -----------------
 * This file initializes and exports a Supabase client instance for use throughout the application.
 * It uses environment variables to configure the Supabase URL and publishable key, ensuring that sensitive information is not hardcoded.
 * 
 * The `createSupabaseClient` function can be imported and called in any component or module that needs to interact with the Supabase backend, providing a consistent way to access the database and authentication features.
 * 
 * @module src/libs/supabase/client
 * @author James Latten
 * @created 2026-04-29
 * @version 1.0.0
 */

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
