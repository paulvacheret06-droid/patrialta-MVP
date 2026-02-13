'use client'

import { useActionState } from 'react'
import { updateMonumentProjet, type ProjetFormState } from '@/actions/monuments'

const TYPE_TRAVAUX_OPTIONS = [
  { value: 'conservation', label: 'Conservation (clos & couvert, structure)' },
  { value: 'restauration', label: 'Restauration (intérieur, décor)' },
  { value: 'accessibilite', label: 'Accessibilité (PMR, mise aux normes)' },
  { value: 'etudes', label: 'Études préalables / diagnostics' },
  { value: 'valorisation', label: 'Valorisation / médiation' },
  { value: 'urgence', label: 'Urgence / péril' },
]

const initialState: ProjetFormState = {}

export default function ModeProjetForm({
  monumentId,
  defaultValues,
}: {
  monumentId: string
  defaultValues?: {
    description_projet?: string | null
    type_travaux?: string[] | null
    budget_estime?: number | null
  }
}) {
  const boundAction = updateMonumentProjet.bind(null, monumentId)
  const [state, formAction, isPending] = useActionState(boundAction, initialState)

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="description_projet" className="block text-sm font-medium text-gray-700 mb-1">
          Description du projet
        </label>
        <textarea
          id="description_projet"
          name="description_projet"
          rows={3}
          defaultValue={defaultValues?.description_projet ?? ''}
          placeholder="Décrivez brièvement le projet de travaux envisagé…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
        />
        {state.errors?.description_projet && (
          <p className="mt-1 text-xs text-red-600">{state.errors.description_projet[0]}</p>
        )}
      </div>

      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">
            Types de travaux envisagés
          </legend>
          <div className="space-y-2">
            {TYPE_TRAVAUX_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="type_travaux"
                  value={opt.value}
                  defaultChecked={defaultValues?.type_travaux?.includes(opt.value) ?? false}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
          {state.errors?.type_travaux && (
            <p className="mt-1 text-xs text-red-600">{state.errors.type_travaux[0]}</p>
          )}
        </fieldset>
      </div>

      <div>
        <label htmlFor="budget_estime" className="block text-sm font-medium text-gray-700 mb-1">
          Budget estimé des travaux (€)
        </label>
        <input
          id="budget_estime"
          name="budget_estime"
          type="number"
          min="0"
          step="1000"
          defaultValue={defaultValues?.budget_estime ?? ''}
          placeholder="Ex : 150000"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
        {state.errors?.budget_estime && (
          <p className="mt-1 text-xs text-red-600">{state.errors.budget_estime[0]}</p>
        )}
      </div>

      {state.errors?._form && (
        <p className="text-sm text-red-600">{state.errors._form[0]}</p>
      )}

      {state.success && (
        <p className="text-sm text-green-600">Projet mis à jour avec succès.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? 'Enregistrement…' : 'Enregistrer le projet'}
      </button>
    </form>
  )
}
