import { describe, it, expect } from 'vitest'
import type { SimulationAide, SimulationCombination } from '@/lib/s2/types'

// Logique pure extraite de la Server Action pour être testable sans Supabase
function computeSimulation(
  budgetEstime: number,
  aides: { id: string; nom: string; taux_max: number | null; montant_max: number | null; plafond_financement_public: number | null }[]
): { combination: SimulationCombination | null; budget_total: number } {
  if (!budgetEstime || budgetEstime <= 0 || aides.length === 0) {
    return { combination: null, budget_total: budgetEstime }
  }

  const aidesDetail: SimulationAide[] = aides.map((aide) => {
    const taux = aide.taux_max ?? 0.4
    const montantEstime = aide.montant_max
      ? Math.min(aide.montant_max, budgetEstime * taux)
      : budgetEstime * taux
    return { id: aide.id, nom: aide.nom, montant_estime: Math.round(montantEstime), taux }
  })

  const totalEstime = aidesDetail.reduce((sum, a) => sum + a.montant_estime, 0)
  const tauxCouverture = totalEstime / budgetEstime
  const plafondMax = Math.max(...aides.map((a) => a.plafond_financement_public ?? 0.8))

  return {
    combination: {
      aides: aidesDetail,
      total_estime: Math.min(totalEstime, Math.round(budgetEstime * plafondMax)),
      taux_couverture: Math.min(tauxCouverture, plafondMax),
      respecte_plafond: tauxCouverture <= plafondMax,
    },
    budget_total: budgetEstime,
  }
}

describe('computeSimulation', () => {
  it('calcule un montant estimé pour une aide simple', () => {
    const { combination } = computeSimulation(100_000, [
      { id: '1', nom: 'Aide DRAC', taux_max: 0.5, montant_max: null, plafond_financement_public: 0.8 },
    ])
    expect(combination).not.toBeNull()
    expect(combination!.aides[0].montant_estime).toBe(50_000)
    expect(combination!.respecte_plafond).toBe(true)
  })

  it('plafonne à 80% pour un cumul dépassant la limite', () => {
    const { combination } = computeSimulation(100_000, [
      { id: '1', nom: 'Aide A', taux_max: 0.5, montant_max: null, plafond_financement_public: 0.8 },
      { id: '2', nom: 'Aide B', taux_max: 0.4, montant_max: null, plafond_financement_public: 0.8 },
    ])
    expect(combination).not.toBeNull()
    // 50k + 40k = 90k > 80k plafond → respecte_plafond = false
    expect(combination!.respecte_plafond).toBe(false)
    expect(combination!.total_estime).toBe(80_000)
  })

  it('retourne combination null si aucune aide', () => {
    const { combination } = computeSimulation(100_000, [])
    expect(combination).toBeNull()
  })
})
