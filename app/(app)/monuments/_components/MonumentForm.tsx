'use client'

import { useActionState, useEffect, useState, useCallback } from 'react'
import { createMonument } from '@/actions/monuments'
import MerimeeSearch, { type MerimeeSelection } from './MerimeeSearch'
import type { MonumentFormState } from '@/lib/validations/monuments'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const initialState: MonumentFormState = {}

const selectClasses =
  'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c5ce9] focus:border-[#0c5ce9]'

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
    <Card variant="elevated" title="Ajouter un monument">
      <form key={formKey} action={formAction} className="space-y-4">
        {state.errors?._form && (
          <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
              color: 'var(--color-error)',
            }}
          >
            {state.errors._form[0]}
          </div>
        )}

        {!isManualMode ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom du monument
              </label>
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
                <div
                  className="rounded-lg px-4 py-3 text-sm border border-gray-200"
                  style={{ backgroundColor: '#f8fafc' }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">{selection.nom}</p>
                    <span
                      className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, white)',
                        color: 'var(--color-success)',
                      }}
                    >
                      Mérimée
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {selection.commune} · {selection.departement} · {selection.region}
                  </p>
                </div>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsManualMode(true)}
              className="text-sm hover:underline"
              style={{ color: 'var(--color-secondary)' }}
            >
              Je ne trouve pas mon monument
            </button>
          </>
        ) : (
          <>
            <div
              className="rounded-lg px-3 py-2 text-xs font-medium"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, white)',
                border: '1px solid color-mix(in srgb, var(--color-warning) 25%, transparent)',
                color: '#92400e',
              }}
            >
              Saisie manuelle
            </div>

            <Input
              id="nom"
              name="nom"
              type="text"
              required
              label="Nom du monument"
              error={state.errors?.nom?.[0]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="commune"
                name="commune"
                type="text"
                required
                label="Commune"
                error={state.errors?.commune?.[0]}
              />
              <Input
                id="departement"
                name="departement"
                type="text"
                required
                label="Département"
                error={state.errors?.departement?.[0]}
              />
            </div>

            <Input
              id="region"
              name="region"
              type="text"
              required
              label="Région"
              error={state.errors?.region?.[0]}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="type_protection" className="text-sm font-medium text-gray-700">
                Type de protection
              </label>
              <select
                id="type_protection"
                name="type_protection"
                className={selectClasses}
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
              className="text-sm hover:underline"
              style={{ color: 'var(--color-secondary)' }}
            >
              ← Revenir à la recherche
            </button>
          </>
        )}

        {(selection || isManualMode) && (
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isPending}
            className="w-full"
          >
            {isPending ? 'Ajout en cours…' : 'Ajouter le monument'}
          </Button>
        )}
      </form>
    </Card>
  )
}
