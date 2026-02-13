/**
 * Envoi des alertes pending via Brevo.
 *
 * - Récupère les alertes pending (max 100, scheduled_for <= now)
 * - Groupe par user_id pour composer un email par utilisateur
 * - Envoie via Brevo API v3
 * - Marque statut = 'sent'
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BATCH_SIZE = 100

interface AlertRow {
  id: string
  user_id: string
  monument_id: string
  aide_id: string
  type: string
  metadata: Record<string, string> | null
  monument: { nom: string; commune: string } | null
  aide: { nom: string; date_depot_fin: string | null } | null
}

function formatAlertLine(alert: AlertRow): string {
  const monumentLabel = alert.monument
    ? `${alert.monument.nom} (${alert.monument.commune})`
    : alert.monument_id

  if (alert.type === 'nouvelle_aide') {
    return `• Nouvelle aide disponible : "${alert.metadata?.aide_nom ?? alert.aide?.nom ?? '?'}" — compatible avec ${monumentLabel}`
  }

  if (alert.type === 'deadline_approche') {
    const deadline = alert.metadata?.date_depot_fin ?? alert.aide?.date_depot_fin
    const deadlineStr = deadline
      ? new Date(deadline).toLocaleDateString('fr-FR')
      : '?'
    return `• Date limite approche (${deadlineStr}) : "${alert.metadata?.aide_nom ?? alert.aide?.nom ?? '?'}" — ${monumentLabel}`
  }

  return `• Alerte : ${alert.type} — ${monumentLabel}`
}

async function sendBrevoEmail(to: string, subject: string, textContent: string): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return false

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'PatriAlta', email: 'noreply@patri-alta.fr' },
      to: [{ email: to }],
      subject,
      textContent,
    }),
  })

  return response.ok
}

export async function sendPendingAlerts(): Promise<{ sent: number; failed: number }> {
  const now = new Date().toISOString()

  // Récupérer les alertes pending éligibles
  const { data: alerts } = await supabaseAdmin
    .from('alerts')
    .select(`
      id, user_id, monument_id, aide_id, type, metadata,
      monument:monuments(nom, commune),
      aide:aides(nom, date_depot_fin)
    `)
    .eq('statut', 'pending')
    .lte('scheduled_for', now)
    .limit(BATCH_SIZE)

  if (!alerts || alerts.length === 0) return { sent: 0, failed: 0 }

  // Grouper par user_id
  const byUser = new Map<string, AlertRow[]>()
  for (const alert of alerts) {
    const row = alert as unknown as AlertRow
    const existing = byUser.get(row.user_id) ?? []
    existing.push(row)
    byUser.set(row.user_id, existing)
  }

  let sent = 0
  let failed = 0

  for (const [userId, userAlerts] of byUser) {
    // Récupérer l'email de l'utilisateur via profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle()

    const email = profile?.email
    if (!email) {
      failed += userAlerts.length
      continue
    }

    // Composer l'email
    const lines = userAlerts.map(formatAlertLine)
    const subject =
      userAlerts.length === 1
        ? `PatriAlta — ${userAlerts[0].type === 'nouvelle_aide' ? 'Nouvelle aide disponible' : 'Deadline approche'}`
        : `PatriAlta — ${userAlerts.length} alertes patrimoine`

    const textContent = [
      'Bonjour,',
      '',
      'Voici vos alertes PatriAlta :',
      '',
      ...lines,
      '',
      'Connectez-vous à PatriAlta pour consulter vos aides et dossiers.',
      '',
      '---',
      'PatriAlta — patri-alta.fr',
      'Pour ne plus recevoir ces alertes, rendez-vous dans vos paramètres.',
    ].join('\n')

    const ok = await sendBrevoEmail(email, subject, textContent)

    // Marquer les alertes comme envoyées ou failed
    const alertIds = userAlerts.map((a) => a.id)
    await supabaseAdmin
      .from('alerts')
      .update({ statut: ok ? 'sent' : 'pending', updated_at: new Date().toISOString() })
      .in('id', alertIds)

    if (ok) sent += userAlerts.length
    else failed += userAlerts.length
  }

  return { sent, failed }
}
