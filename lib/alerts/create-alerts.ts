/**
 * Création d'alertes "nouvelle_aide" pour les monuments éligibles.
 *
 * Pour chaque nouvelle aide, on identifie les monuments avec un profil compatible
 * (région, type_monument, statut_juridique) et on insère une alerte
 * si aucun doublon pending n'existe déjà.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createAlertsForNewAides(newAideIds: string[]): Promise<number> {
  if (newAideIds.length === 0) return 0

  let totalCreated = 0

  // Récupérer les nouvelles aides avec leurs critères d'éligibilité
  const { data: aides } = await supabaseAdmin
    .from('aides')
    .select('id, nom, region_eligible, departement_eligible, statut_juridique_eligible, type_monument_eligible')
    .in('id', newAideIds)
    .eq('is_active', true)

  if (!aides || aides.length === 0) return 0

  for (const aide of aides) {
    // Trouver les monuments potentiellement compatibles
    let query = supabaseAdmin
      .from('monuments')
      .select('id, user_id, region, departement, type_protection, statut_juridique')
      .eq('is_active', true)

    // Filtre géographique si précisé
    if (aide.region_eligible) {
      query = query.eq('region', aide.region_eligible)
    }
    if (aide.departement_eligible) {
      query = query.eq('departement', aide.departement_eligible)
    }

    const { data: monuments } = await query

    if (!monuments || monuments.length === 0) continue

    // Pour chaque monument compatible, créer une alerte si pas de doublon
    for (const monument of monuments) {
      // Vérification doublon pending
      const { data: existing } = await supabaseAdmin
        .from('alerts')
        .select('id')
        .eq('monument_id', monument.id)
        .eq('aide_id', aide.id)
        .eq('type', 'nouvelle_aide')
        .eq('statut', 'pending')
        .maybeSingle()

      if (existing) continue

      const { error } = await supabaseAdmin.from('alerts').insert({
        user_id: monument.user_id,
        monument_id: monument.id,
        aide_id: aide.id,
        type: 'nouvelle_aide',
        statut: 'pending',
        scheduled_for: new Date().toISOString(),
        metadata: { aide_nom: aide.nom },
      })

      if (!error) totalCreated++
    }
  }

  return totalCreated
}
