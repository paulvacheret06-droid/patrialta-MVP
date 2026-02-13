'use client'

import Link from 'next/link'
import { useTransition, useState } from 'react'
import { deleteMonument } from '@/actions/monuments'

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
    <ul className="divide-y divide-gray-100">
      {monuments.map((m) => (
        <li key={m.id} className="py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-gray-900 truncate">{m.nom}</span>
              {m.type_protection && (
                <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                  {PROTECTION_LABELS[m.type_protection] ?? m.type_protection}
                </span>
              )}
              {m.is_verified_merimee && (
                <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                  Mérimée
                </span>
              )}
              {((m.type_travaux && m.type_travaux.length > 0) || m.budget_estime) && (
                <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">
                  Mode projet
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {m.commune} · {m.departement} · {m.region}
            </p>
          </div>

          <div className="flex-shrink-0 flex items-center gap-2">
            <Link
              href={`/monuments/${m.id}/aides`}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Voir les aides
            </Link>
            <span className="text-gray-300">·</span>
            <Link
              href={`/monuments/${m.id}/edit`}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Mode projet
            </Link>
            <span className="text-gray-300">·</span>
            {pendingDeleteId === m.id ? (
              <>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={isPending}
                  className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  {isPending ? '…' : 'Confirmer'}
                </button>
                <button
                  onClick={() => setPendingDeleteId(null)}
                  disabled={isPending}
                  className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Annuler
                </button>
              </>
            ) : (
              <button
                onClick={() => setPendingDeleteId(m.id)}
                className="text-xs text-gray-400 hover:text-red-600 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
