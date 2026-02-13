'use client'

import { useState, useTransition } from 'react'
import { calculateSimulation } from '@/actions/simulation'
import type { SimulationResult } from '@/lib/s2/types'

export default function SimulateurFinancement({ monumentId }: { monumentId: string }) {
  const [budget, setBudget] = useState('')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = Number(budget)
    if (!val || val <= 0) {
      setError('Veuillez saisir un budget positif.')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const res = await calculateSimulation(monumentId, val)
        setResult(res)
      } catch {
        setError('Erreur lors du calcul. Veuillez réessayer.')
      }
    })
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Simulateur de financement</h2>
      <p className="text-xs text-gray-500 mb-4">
        Estimez le montant total des aides éligibles en fonction du coût de vos travaux.
      </p>

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="budget" className="block text-xs font-medium text-gray-700 mb-1">
            Budget estimé des travaux (€)
          </label>
          <input
            id="budget"
            type="number"
            min="0"
            step="1000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Ex : 150 000"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isPending ? 'Calcul…' : 'Simuler'}
        </button>
      </form>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {result && result.combinations.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">
          Aucune aide éligible identifiée — impossible de simuler un plan de financement.
        </p>
      )}

      {result && result.combinations.length > 0 && (() => {
        const combo = result.combinations[0]
        return (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Budget total</span>
              <span className="font-medium">{result.budget_total.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="space-y-1.5">
              {combo.aides.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 truncate mr-2">{a.nom}</span>
                  <span className="text-gray-900 font-medium flex-shrink-0">
                    ~{a.montant_estime.toLocaleString('fr-FR')} €
                    <span className="text-gray-400 font-normal ml-1">
                      ({Math.round(a.taux * 100)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-900">Total estimé des aides</span>
              <span className="text-sm font-semibold text-gray-900">
                ~{combo.total_estime.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Taux de couverture</span>
              <span>{Math.round(combo.taux_couverture * 100)}%</span>
            </div>
            {!combo.respecte_plafond && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <span>⚠</span>
                <span>
                  Le cumul des aides dépasse le plafond de financement public autorisé.
                  Le montant total a été plafonné automatiquement.
                </span>
              </div>
            )}
            <p className="text-xs text-gray-400 italic">
              Montants indicatifs — à valider avec les organismes financeurs.
            </p>
          </div>
        )
      })()}
    </div>
  )
}
