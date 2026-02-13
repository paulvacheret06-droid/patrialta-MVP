'use server'

import { createClient } from '@/lib/supabase/server'
import type { SimulationResult, SimulationCombination, SimulationAide } from '@/lib/s2/types'
import type { ReglesCumul } from '@/lib/s1/types'

type EligibilityRow = {
  aide_id: string
  criteres_manquants: unknown[]
  criteres_a_verifier: unknown[]
  aide: {
    id: string
    nom: string
    montant_max: number | null
    taux_max: number | null
    plafond_financement_public: number | null
    regles_cumul: ReglesCumul | null
  }
}

export async function calculateSimulation(
  monumentId: string,
  budgetEstime: number
): Promise<SimulationResult> {
  if (!budgetEstime || budgetEstime <= 0) {
    return { combinations: [], budget_total: budgetEstime }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // Charge les aides éligibles (criteres_manquants vide = éligible)
  const { data: rows, error } = await supabase
    .from('eligibility_results')
    .select('aide_id, criteres_manquants, criteres_a_verifier, aide:aides(id, nom, montant_max, taux_max, plafond_financement_public, regles_cumul)')
    .eq('monument_id', monumentId)

  if (error) throw new Error('Erreur lors du chargement des résultats')

  // Filtre : uniquement les aides éligibles (pas de critères manquants)
  const aidesEligibles = ((rows ?? []) as unknown as EligibilityRow[]).filter(
    (r) => Array.isArray(r.criteres_manquants) && r.criteres_manquants.length === 0
  )

  if (aidesEligibles.length === 0) {
    return { combinations: [], budget_total: budgetEstime }
  }

  // Calcul simplifié : une combinaison = toutes les aides éligibles
  const aidesDetail: SimulationAide[] = aidesEligibles.map((r) => {
    const aide = r.aide
    const taux = aide.taux_max ?? 0.4 // taux par défaut 40% si non renseigné
    const montantEstime = aide.montant_max
      ? Math.min(aide.montant_max, budgetEstime * taux)
      : budgetEstime * taux

    return {
      id: aide.id,
      nom: aide.nom,
      montant_estime: Math.round(montantEstime),
      taux,
    }
  })

  const totalEstime = aidesDetail.reduce((sum, a) => sum + a.montant_estime, 0)
  const tauxCouverture = budgetEstime > 0 ? totalEstime / budgetEstime : 0

  // Vérification plafond financement public (80% par défaut)
  const plafondMax = aidesEligibles.reduce((max, r) => {
    const p = r.aide.regles_cumul?.plafond_financement_public ?? r.aide.plafond_financement_public ?? 0.8
    return Math.max(max, p)
  }, 0.8)

  const combination: SimulationCombination = {
    aides: aidesDetail,
    total_estime: Math.min(totalEstime, Math.round(budgetEstime * plafondMax)),
    taux_couverture: Math.min(tauxCouverture, plafondMax),
    respecte_plafond: tauxCouverture <= plafondMax,
  }

  return {
    combinations: [combination],
    budget_total: budgetEstime,
  }
}
