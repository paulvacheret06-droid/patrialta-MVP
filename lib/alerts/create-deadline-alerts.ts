/**
 * Création d'alertes "deadline_approche" pour les aides avec date_depot_fin
 * dans les 30 prochains jours.
 *
 * Croise les aides avec deadline proche avec les monuments éligibles
 * (via eligibility_results) et insère des alertes sans doublons.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createDeadlineAlerts(): Promise<number> {
  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Aides avec deadline dans les 30 jours
  const { data: aidesAvecDeadline } = await supabaseAdmin
    .from('aides')
    .select('id, nom, date_depot_fin')
    .gte('date_depot_fin', now.toISOString())
    .lte('date_depot_fin', in30Days.toISOString())
    .eq('is_active', true)

  if (!aidesAvecDeadline || aidesAvecDeadline.length === 0) return 0

  let totalCreated = 0

  for (const aide of aidesAvecDeadline) {
    // Trouver les monuments éligibles à cette aide (criteres_manquants vide)
    const { data: eligibilityResults } = await supabaseAdmin
      .from('eligibility_results')
      .select('monument_id, criteres_manquants')
      .eq('aide_id', aide.id)

    if (!eligibilityResults) continue

    const eligibleMonumentIds = eligibilityResults
      .filter((r) => {
        const manquants = (r.criteres_manquants as unknown[]) ?? []
        return manquants.length === 0
      })
      .map((r) => r.monument_id)

    if (eligibleMonumentIds.length === 0) continue

    // Récupérer les monuments + user_id
    const { data: monuments } = await supabaseAdmin
      .from('monuments')
      .select('id, user_id')
      .in('id', eligibleMonumentIds)

    if (!monuments) continue

    for (const monument of monuments) {
      // Vérification doublon pending
      const { data: existing } = await supabaseAdmin
        .from('alerts')
        .select('id')
        .eq('monument_id', monument.id)
        .eq('aide_id', aide.id)
        .eq('type', 'deadline_approche')
        .eq('statut', 'pending')
        .maybeSingle()

      if (existing) continue

      const { error } = await supabaseAdmin.from('alerts').insert({
        user_id: monument.user_id,
        monument_id: monument.id,
        aide_id: aide.id,
        type: 'deadline_approche',
        statut: 'pending',
        scheduled_for: new Date().toISOString(),
        metadata: {
          aide_nom: aide.nom,
          date_depot_fin: aide.date_depot_fin,
        },
      })

      if (!error) totalCreated++
    }
  }

  return totalCreated
}
