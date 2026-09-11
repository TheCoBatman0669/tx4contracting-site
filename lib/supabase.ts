import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client for the admin area.
 *
 * Created lazily so that a missing environment variable surfaces as a handled
 * error inside the admin UI rather than crashing the whole site at import time.
 *
 * This client only ever holds the anon key and an administrator's own session.
 * It has no elevated rights: every table it can reach is gated by RLS policies
 * that check admin_users membership, so a signed-in non-admin sees nothing.
 */

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase environment variables are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'tx4-admin-auth',
    },
  });

  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
