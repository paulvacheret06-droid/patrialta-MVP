'use client'

import { useActionState, useEffect, useState, useCallback } from 'react'
import { createMonument } from '@/actions/monuments'
import MerimeeSearch, { type MerimeeSelection } from './MerimeeSearch'
import type { MonumentFormState } from '@/lib/validations/monuments'

const initialState: MonumentFormState = {}

export default function MonumentForm() {
  const [state, formAction, isPending] = useActionState(createMonument, initialState)
  const [isManualMode, setIsManualMode] = useState(false)
  const [selection, setSelection] = useState<MerimeeSelection | null>(null)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (state.success) {
      setIsManualMode(false)
      setSelection(null)
      setFormKey((k) => k + 1)
    }
  }, [state.success])

  const handleSelect = useCallback((result: MerimeeSelection) => {
    setSelection(result)
  }, [])

  const handleFallback = useCallback(() => {
    setIsManualMode(true)
  }, [])

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Ajouter un monument</h2>

      <form key={formKey} action={formAction} className="space-y-4">
        {state.errors?._form && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.errors._form[0]}
          </div>
        )}

        {!isManualMode ? (
          <>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nom du monument</label>
              <MerimeeSearch onSelect={handleSelect} onFallback={handleFallback} />
            </div>

            {selection && (
              <>
                <input type="hidden" name="nom" value={selection.nom} />
                <input type="hidden" name="commune" value={selection.commune} />
                <input type="hidden" name="departement" value={selection.departement} />
                <input type="hidden" name="region" value={selection.region} />
                <input type="hidden" name="ref_merimee" value={selection.ref_merimee} />
                {selection.type_protection && (
                  <input
                    type="hidden"
                    name="type_protection"
                    value={selection.type_protection}
                  />
                )}
                <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3 text-sm">
                  <p className="font-medium text-gray-900">{selection.nom}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {selection.commune} · {selection.departement} · {selection.region}
                  </p>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsManualMode(true)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Je ne trouve pas mon monument
            </button>
          </>
        ) : (
          <>
            <div className="rounded px-3 py-2 text-xs text-amber-800 bg-amber-50 border border-amber-200">
              Saisie manuelle
            </div>

            <div>
              <label htmlFor="nom" className="block text-sm text-gray-600 mb-1">
                Nom du monument <span className="text-red-500">*</span>
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {state.errors?.nom && (
                <p className="mt-1 text-xs text-red-600">{state.errors.nom[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="commune" className="block text-sm text-gray-600 mb-1">
                  Commune <span className="text-red-500">*</span>
                </label>
                <input
                  id="commune"
                  name="commune"
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                {state.errors?.commune && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.commune[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="departement" className="block text-sm text-gray-600 mb-1">
                  Département <span className="text-red-500">*</span>
                </label>
                <input
                  id="departement"
                  name="departement"
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                {state.errors?.departement && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.departement[0]}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="region" className="block text-sm text-gray-600 mb-1">
                Région <span className="text-red-500">*</span>
              </label>
              <input
                id="region"
                name="region"
                type="text"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {state.errors?.region && (
                <p className="mt-1 text-xs text-red-600">{state.errors.region[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="type_protection" className="block text-sm text-gray-600 mb-1">
                Type de protection
              </label>
              <select
                id="type_protection"
                name="type_protection"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Non précisé</option>
                <option value="classe">Classé Monument Historique</option>
                <option value="inscrit">Inscrit Monument Historique</option>
                <option value="spr">Site Patrimonial Remarquable (SPR)</option>
                <option value="label_fdp">Label Fondation du Patrimoine</option>
                <option value="non_protege">Non protégé</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsManualMode(false)
                setSelection(null)
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Revenir à la recherche
            </button>
          </>
        )}

        {(selection || isManualMode) && (
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Ajout en cours…' : 'Ajouter le monument'}
          </button>
        )}
      </form>
    </div>
  )
}
