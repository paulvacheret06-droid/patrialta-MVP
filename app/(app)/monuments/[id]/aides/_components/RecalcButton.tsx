'use client'

import { useTransition } from 'react'
import { runMatching } from '@/actions/matching'

export default function RecalcButton({ monumentId }: { monumentId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleRecalc() {
    startTransition(async () => {
      await runMatching(monumentId)
    })
  }

  return (
    <button
      onClick={handleRecalc}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isPending ? (
        <>
          <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Calcul en cours…
        </>
      ) : (
        'Recalculer'
      )}
    </button>
  )
}
