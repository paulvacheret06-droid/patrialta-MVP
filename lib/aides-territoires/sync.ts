/**
 * Service de synchronisation des aides Aides-territoires → PatriAlta.
 *
 * Logique diff :
 * - upsert des aides actives (insert ou update via external_id)
 * - marquer inactives les aides non retrouvées dans la réponse API
 * - alerte email Brevo si > 20% d'aides invalides
 */
import { createClient } from '@supabase/supabase-js'
import type { AideTerritorie } from '@/lib/validations/aides-territoires'
import { transformAideTerritorie } from './transformer'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface SyncReport {
  inserted: number
  updated: number
  skipped: number
  marked_inactive: number
  errors: string[]
  alert_sent: boolean
}

/**
 * Upsert un lot d'aides Aides-territoires dans la table `aides`.
 * Retourne les compteurs d'opérations.
 */
export async function upsertAides(
  aides: AideTerritorie[]
): Promise<{ inserted: number; updated: number; skipped: number; errors: string[] }> {
  let inserted = 0
  let updated = 0
  let skipped = 0
  const errors: string[] = []

  for (const aide of aides) {
    try {
      const transformed = transformAideTerritorie(aide)

      // Recherche par external_id pour savoir si c'est un insert ou update
      const { data: existing } = await getSupabaseAdmin()
        .from('aides')
        .select('id')
        .eq('external_id', aide.id)
        .maybeSingle()

      if (existing) {
        const { error } = await getSupabaseAdmin()
          .from('aides')
          .update({ ...transformed, last_synced_at: new Date().toISOString() })
          .eq('id', existing.id)

        if (error) {
          errors.push(`Update ${aide.id}: ${error.message}`)
          skipped++
        } else {
          updated++
        }
      } else {
        const { error } = await getSupabaseAdmin().from('aides').insert(transformed)

        if (error) {
          errors.push(`Insert ${aide.id}: ${error.message}`)
          skipped++
        } else {
          inserted++
        }
      }
    } catch (err) {
      errors.push(`Transform ${aide.id}: ${(err as Error).message}`)
      skipped++
    }
  }

  return { inserted, updated, skipped, errors }
}

/**
 * Marque comme inactives les aides dont l'external_id
 * n'est plus présent dans la réponse API courante.
 */
export async function markInactiveAides(activeExternalIds: string[]): Promise<number> {
  if (activeExternalIds.length === 0) return 0

  // Récupérer tous les external_id en base
  const { data: allAides } = await getSupabaseAdmin()
    .from('aides')
    .select('id, external_id')
    .not('external_id', 'is', null)

  if (!allAides) return 0

  const toDeactivate = allAides.filter(
    (a) => a.external_id && !activeExternalIds.includes(a.external_id)
  )

  if (toDeactivate.length === 0) return 0

  const { error } = await getSupabaseAdmin()
    .from('aides')
    .update({ is_active: false, last_synced_at: new Date().toISOString() })
    .in(
      'id',
      toDeactivate.map((a) => a.id)
    )

  return error ? 0 : toDeactivate.length
}

/**
 * Envoie une alerte email via Brevo si trop d'aides invalides.
 */
async function sendBrevoAlert(message: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'PatriAlta Sync', email: 'noreply@patri-alta.fr' },
      to: [{ email: process.env.ALERT_EMAIL ?? 'admin@patri-alta.fr' }],
      subject: '[PatriAlta] Alerte sync Aides-territoires',
      textContent: message,
    }),
  })
}

/**
 * Fonction principale de sync.
 * Orchestre upsert + mark inactive + alerte si taux d'erreur > 20%.
 */
export async function runSync(aides: AideTerritorie[]): Promise<SyncReport> {
  const totalFetched = aides.length
  const { inserted, updated, skipped, errors } = await upsertAides(aides)
  const marked_inactive = await markInactiveAides(aides.map((a) => a.id))

  let alert_sent = false
  const errorRate = totalFetched > 0 ? skipped / totalFetched : 0

  if (errorRate > 0.2) {
    const message = [
      `Sync Aides-territoires : taux d'erreurs élevé (${Math.round(errorRate * 100)}%).`,
      `Total récupéré : ${totalFetched}`,
      `Insérés : ${inserted} | Mis à jour : ${updated} | Ignorés : ${skipped}`,
      `Erreurs : ${errors.slice(0, 10).join('\n')}`,
    ].join('\n')

    await sendBrevoAlert(message)
    alert_sent = true
  }

  return { inserted, updated, skipped, marked_inactive, errors, alert_sent }
}
