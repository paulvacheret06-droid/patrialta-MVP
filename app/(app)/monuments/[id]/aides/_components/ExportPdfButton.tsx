'use client'

import { useState } from 'react'

export default function ExportPdfButton({ monumentId }: { monumentId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleExport() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/monuments/${monumentId}/export-pdf`)
      if (!res.ok) throw new Error('Erreur lors de la génération du PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="(.+)"/)
      a.download = match ? match[1] : `aides-${monumentId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? (
        <>
          <span className="animate-spin inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full" />
          Génération…
        </>
      ) : (
        <>
          ↓ Exporter PDF
        </>
      )}
    </button>
  )
}
