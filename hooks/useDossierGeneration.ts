'use client'

import { useState, useCallback, useRef } from 'react'

export interface SectionProgress {
  sectionId: string
  titre: string
  contenu: string
  isComplete: boolean
}

interface UseDossierGenerationReturn {
  isGenerating: boolean
  sections: Record<string, SectionProgress>
  error: string | null
  generate: (dossierId: string) => Promise<void>
  abort: () => void
}

/**
 * Hook client pour consommer la route SSE de génération de dossier.
 * Gère le parsing des événements, l'accumulation du contenu par section,
 * et l'état d'erreur.
 */
export function useDossierGeneration(): UseDossierGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [sections, setSections] = useState<Record<string, SectionProgress>>({})
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsGenerating(false)
  }, [])

  const generate = useCallback(async (dossierId: string) => {
    setIsGenerating(true)
    setError(null)
    setSections({})

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch('/api/dossiers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierId }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        const text = await response.text()
        setError(`Erreur serveur (${response.status}): ${text}`)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        let currentEvent = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const rawData = line.slice(6)
            try {
              const data = JSON.parse(rawData)
              handleEvent(currentEvent, data)
            } catch {
              // Ligne data invalide — ignorée
            }
            currentEvent = ''
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message ?? 'Erreur de connexion')
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }

    function handleEvent(event: string, data: Record<string, unknown>) {
      switch (event) {
        case 'section_start':
          setSections((prev) => ({
            ...prev,
            [data.sectionId as string]: {
              sectionId: data.sectionId as string,
              titre: data.titre as string,
              contenu: '',
              isComplete: false,
            },
          }))
          break

        case 'chunk':
          setSections((prev) => {
            const section = prev[data.sectionId as string]
            if (!section) return prev
            return {
              ...prev,
              [data.sectionId as string]: {
                ...section,
                contenu: section.contenu + (data.text as string),
              },
            }
          })
          break

        case 'section_end':
          setSections((prev) => {
            const section = prev[data.sectionId as string]
            if (!section) return prev
            return {
              ...prev,
              [data.sectionId as string]: { ...section, isComplete: true },
            }
          })
          break

        case 'error':
          setError((data.message as string) ?? 'Erreur lors de la génération')
          break

        case 'done':
          // La génération est terminée
          break
      }
    }
  }, [])

  return { isGenerating, sections, error, generate, abort }
}
