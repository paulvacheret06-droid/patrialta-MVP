'use client'

import { useState, useRef } from 'react'
import { updateDossierSection } from '@/actions/dossiers'

interface SectionEditorProps {
  dossierId: string
  sectionId: string
  titre: string
  contenuInitial: string
  isEdite: boolean
  obligatoire: boolean
}

export default function SectionEditor({
  dossierId,
  sectionId,
  titre,
  contenuInitial,
  isEdite: isEditeInitial,
  obligatoire,
}: SectionEditorProps) {
  const [contenu, setContenu] = useState(contenuInitial)
  const [isEdite, setIsEdite] = useState(isEditeInitial)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleBlur = async () => {
    if (contenu === contenuInitial && !isEdite) return

    setIsSaving(true)
    setSaveError(null)

    const result = await updateDossierSection(dossierId, sectionId, contenu)

    if ('error' in result) {
      setSaveError(result.error)
    } else {
      setIsEdite(true)
    }
    setIsSaving(false)
  }

  const handleChange = (value: string) => {
    setContenu(value)
    // Debounce auto-save à 2s
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      handleBlur()
    }, 2000)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-800">{titre}</h3>
          {!obligatoire && (
            <span className="text-xs text-gray-400">(optionnel)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isEdite && (
            <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              Modifié manuellement
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-gray-400">Enregistrement…</span>
          )}
        </div>
      </div>

      <textarea
        value={contenu}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        rows={8}
        className="w-full text-sm text-gray-700 leading-relaxed resize-y rounded border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent"
        placeholder="Le contenu sera généré automatiquement…"
      />

      {saveError && (
        <p className="text-xs text-red-600 mt-1">{saveError}</p>
      )}
    </div>
  )
}
