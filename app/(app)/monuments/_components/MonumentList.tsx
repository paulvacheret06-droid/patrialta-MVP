'use client'

import Link from 'next/link'
import { useTransition, useState } from 'react'
import { deleteMonument } from '@/actions/monuments'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

type Monument = {
  id: string
  nom: string
  commune: string
  departement: string
  region: string
  type_protection: string | null
  is_verified_merimee: boolean
  type_travaux: string[] | null
  budget_estime: number | null
}

const PROTECTION_LABELS: Record<string, string> = {
  classe: 'Classé MH',
  inscrit: 'Inscrit MH',
  spr: 'SPR',
  label_fdp: 'Label FdP',
  non_protege: 'Non protégé',
}

const PROTECTED_TYPES = new Set(['classe', 'inscrit', 'spr', 'label_fdp'])

interface MonumentListProps {
  monuments: Monument[]
}

export default function MonumentList({ monuments }: MonumentListProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteMonument(id)
      setPendingDeleteId(null)
    })
  }

  return (
    <div className="space-y-3">
      {monuments.map((m) => (
        <Card key={m.id} variant="interactive">
          {/* Nom + badges */}
          <div className="flex items-start gap-2 flex-wrap mb-1.5">
            <span className="font-semibold text-base text-gray-900 leading-snug">{m.nom}</span>
            {m.type_protection && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0"
                style={
                  PROTECTED_TYPES.has(m.type_protection)
                    ? {
                        backgroundColor: 'rgba(8, 26, 75, 0.06)',
                        color: 'var(--color-primary)',
                      }
                    : { backgroundColor: '#f3f4f6', color: '#4b5563' }
                }
              >
                {PROTECTION_LABELS[m.type_protection] ?? m.type_protection}
              </span>
            )}
            {m.is_verified_merimee && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-secondary) 10%, white)',
                  color: 'var(--color-secondary)',
                }}
              >
                Mérimée
              </span>
            )}
            {((m.type_travaux && m.type_travaux.length > 0) || m.budget_estime) && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, white)',
                  color: '#92400e',
                }}
              >
                Mode projet
              </span>
            )}
          </div>

          {/* Localisation */}
          <p className="text-sm text-gray-500 mb-4">
            {m.commune} · {m.departement} · {m.region}
          </p>

          {/* Actions */}
          <div className="border-t border-gray-100 pt-3 flex items-center gap-2 flex-wrap">
            <Link
              href={`/monuments/${m.id}/aides`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Voir les aides
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            <Link
              href={`/monuments/${m.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Mode projet
            </Link>

            <div className="ml-auto flex items-center gap-2">
              {pendingDeleteId === m.id ? (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDelete(m.id)}
                  >
                    {isPending ? '…' : 'Confirmer'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => setPendingDeleteId(null)}
                  >
                    Annuler
                  </Button>
                </>
              ) : (
                <button
                  onClick={() => setPendingDeleteId(m.id)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-[#ef4444] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
