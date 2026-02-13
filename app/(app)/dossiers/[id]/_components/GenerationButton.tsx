'use client'

import { useRouter } from 'next/navigation'
import { useDossierGeneration } from '@/hooks/useDossierGeneration'

interface GenerationButtonProps {
  dossierId: string
  statut: string
}

export default function GenerationButton({ dossierId, statut }: GenerationButtonProps) {
  const router = useRouter()
  const { isGenerating, sections, error, generate, abort } = useDossierGeneration()

  const handleGenerate = async () => {
    await generate(dossierId)
    // Rafraîchir la page pour afficher le contenu sauvegardé
    router.refresh()
  }

  // Affichage en cours de streaming
  if (isGenerating) {
    const sectionsList = Object.values(sections)
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="animate-spin h-4 w-4 text-stone-700" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Génération en cours…
          </div>
          <button
            onClick={abort}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Annuler
          </button>
        </div>

        {/* Sections en temps réel */}
        {sectionsList.length > 0 && (
          <div className="space-y-3 mt-3">
            {sectionsList.map((section) => (
              <div key={section.sectionId} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-700">{section.titre}</span>
                  {section.isComplete && (
                    <span className="text-xs text-green-600">✓</span>
                  )}
                </div>
                {section.contenu && (
                  <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-3">
                    {section.contenu}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={statut === 'finalise'}
        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-stone-800 text-white hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {Object.keys(sections).length > 0 ? 'Regénérer le dossier' : 'Générer le dossier'}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
