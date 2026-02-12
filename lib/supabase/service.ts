import { createClient } from '@supabase/supabase-js'

/**
 * Client Supabase avec service_role — bypasse le RLS.
 * ⚠️ USAGE RESTREINT : cron jobs et webhooks internes uniquement.
 * Ne jamais utiliser côté client, ne jamais logger, ne jamais committer la clé.
 */
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
