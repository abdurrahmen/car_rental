import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Admin/service-role Supabase client.
 * NEVER use this in client components or expose the service role key.
 * This bypasses RLS — use only for admin operations on the server.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL env variables. ' +
      'The admin client requires the service role key.',
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
