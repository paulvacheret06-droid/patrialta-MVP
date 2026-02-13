'use client'

import { useState } from 'react'

interface ExportButtonsProps {
  dossierId: string
}

export default function ExportButtons({ dossierId }: ExportButtonsProps) {
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingDocx, setLoadingDocx] = useState(false)

  const handleExport = async (format: 'pdf' | 'docx') => {
    const setLoading = format === 'pdf' ? setLoadingPdf : setLoadingDocx
    setLoading(true)

    try {
      const response = await fetch(`/api/dossiers/${dossierId}/export?format=${format}`)
      if (!response.ok) {
        const err = await response.json()
        alert(err.error ?? 'Erreur lors de l\'export.')
        return
      }

      const blob = await response.blob()
      const ext = format === 'pdf' ? 'pdf' : 'docx'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dossier.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => handleExport('pdf')}
        disabled={loadingPdf || loadingDocx}
        className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loadingPdf ? (
          <>
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Génération PDF…
          </>
        ) : (
          'Exporter PDF'
        )}
      </button>
      <button
        onClick={() => handleExport('docx')}
        disabled={loadingPdf || loadingDocx}
        className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loadingDocx ? (
          <>
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Génération Word…
          </>
        ) : (
          'Exporter Word'
        )}
      </button>
    </div>
  )
}
