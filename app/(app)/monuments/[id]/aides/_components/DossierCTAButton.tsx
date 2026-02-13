'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDossier } from '@/actions/dossiers'

interface DossierCTAButtonProps {
  monumentId: string
  aideId: string
}

export default function DossierCTAButton({ monumentId, aideId }: DossierCTAButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setIsLoading(true)
    setError(null)

    const result = await createDossier(monumentId, aideId)

    if ('error' in result) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    router.push(`/dossiers/${result.dossierId}`)
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Création…
          </>
        ) : (
          'Démarrer un dossier →'
        )}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
