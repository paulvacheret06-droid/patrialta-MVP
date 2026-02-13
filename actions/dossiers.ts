'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { DossierStatut } from '@/lib/s2/types'

// ────────────────────────────────────────────────────────────────────────────
// createDossier
// ────────────────────────────────────────────────────────────────────────────

/**
 * Crée un nouveau dossier de demande de subvention.
 *
 * Vérifie :
 * - que l'utilisateur est authentifié et propriétaire du monument
 * - que le monument est éligible à l'aide (eligibility_results)
 * - qu'aucun dossier brouillon/en_cours n'existe déjà pour ce couple
 *
 * @returns l'id du dossier créé
 */
export async function createDossier(
  monumentId: string,
  aideId: string
): Promise<{ dossierId: string } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Vérification ownership du monument via RLS
  const { data: monument } = await supabase
    .from('monuments')
    .select('id')
    .eq('id', monumentId)
    .single()

  if (!monument) return { error: 'Monument introuvable ou accès refusé.' }

  // Vérification éligibilité (criteres_manquants vide = éligible)
  const { data: eligibility } = await supabase
    .from('eligibility_results')
    .select('id, criteres_manquants')
    .eq('monument_id', monumentId)
    .eq('aide_id', aideId)
    .single()

  if (!eligibility) return { error: 'Aucun résultat d\'éligibilité pour cette aide.' }

  const manquants = (eligibility.criteres_manquants as unknown[]) ?? []
  if (manquants.length > 0) {
    return { error: 'Ce monument n\'est pas éligible à cette aide.' }
  }

  // Vérification doublon (brouillon ou en_cours)
  const { data: existing } = await supabase
    .from('dossiers')
    .select('id, statut')
    .eq('monument_id', monumentId)
    .eq('aide_id', aideId)
    .in('statut', ['brouillon', 'en_cours'] satisfies DossierStatut[])
    .maybeSingle()

  if (existing) {
    // Rediriger vers le dossier existant
    return { dossierId: existing.id }
  }

  // Création du dossier
  const { data: dossier, error: insertError } = await supabase
    .from('dossiers')
    .insert({
      monument_id: monumentId,
      aide_id: aideId,
      user_id: user.id,
      statut: 'brouillon' satisfies DossierStatut,
      contenu_genere: null,
    })
    .select('id')
    .single()

  if (insertError || !dossier) {
    return { error: 'Erreur lors de la création du dossier.' }
  }

  return { dossierId: dossier.id }
}

// ────────────────────────────────────────────────────────────────────────────
// updateDossierSection
// ────────────────────────────────────────────────────────────────────────────

export async function updateDossierSection(
  dossierId: string,
  sectionId: string,
  contenu: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Non authentifié.' }

  // Vérification ownership via RLS (select vérifie que le dossier appartient à l'user)
  const { data: dossier } = await supabase
    .from('dossiers')
    .select('id, contenu_genere')
    .eq('id', dossierId)
    .single()

  if (!dossier) return { error: 'Dossier introuvable ou accès refusé.' }

  // Mise à jour partielle du JSONB contenu_genere
  const contenuActuel = (dossier.contenu_genere as Record<string, unknown>) ?? {}
  const sectionActuelle = (contenuActuel[sectionId] as Record<string, unknown>) ?? {}

  const nouveauContenu = {
    ...contenuActuel,
    [sectionId]: {
      ...sectionActuelle,
      contenu,
      is_edite: true,
    },
  }

  const { error } = await supabase
    .from('dossiers')
    .update({ contenu_genere: nouveauContenu, updated_at: new Date().toISOString() })
    .eq('id', dossierId)

  if (error) return { error: 'Erreur lors de la mise à jour.' }

  return { success: true }
}

// ────────────────────────────────────────────────────────────────────────────
// finalizeDossier
// ────────────────────────────────────────────────────────────────────────────

export async function finalizeDossier(
  dossierId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Non authentifié.' }

  // Charger dossier + sections générées
  const { data: dossier } = await supabase
    .from('dossiers')
    .select('id, statut, contenu_genere, aide:aides(organisme_id)')
    .eq('id', dossierId)
    .single()

  if (!dossier) return { error: 'Dossier introuvable ou accès refusé.' }

  // Vérifier que du contenu a été généré
  const contenu = dossier.contenu_genere as Record<string, unknown> | null
  if (!contenu || Object.keys(contenu).length === 0) {
    return { error: 'Le dossier doit être généré avant d\'être finalisé.' }
  }

  const { error } = await supabase
    .from('dossiers')
    .update({
      statut: 'finalise' satisfies DossierStatut,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dossierId)

  if (error) return { error: 'Erreur lors de la finalisation.' }

  return { success: true }
}
