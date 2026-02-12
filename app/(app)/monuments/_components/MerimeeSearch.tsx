'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type MerimeeHit = {
  _id: string
  _source: {
    titre?: string[]
    commune?: string[] | string
    departement?: string[] | string
    region?: string[] | string
    typeProtection?: string[]
    refMerimee?: string
  }
}

export type MerimeeSelection = {
  nom: string
  commune: string
  departement: string
  region: string
  ref_merimee: string
  type_protection: string | null
}

function mapTypeProtection(types: string[] | undefined): string | null {
  if (!types || types.length === 0) return null
  const t = types[0].toLowerCase()
  if (t.includes('classé') || t.includes('classe')) return 'classe'
  if (t.includes('inscrit')) return 'inscrit'
  if (t.includes('spr')) return 'spr'
  return null
}

function firstOf(v: string | string[] | undefined): string {
  if (!v) return ''
  return Array.isArray(v) ? (v[0] ?? '') : v
}

interface MerimeeSearchProps {
  onSelect: (result: MerimeeSelection) => void
  onFallback: () => void
}

export default function MerimeeSearch({ onSelect, onFallback }: MerimeeSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MerimeeHit[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Stabilise callbacks to avoid effect re-runs
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const onFallbackRef = useRef(onFallback)
  onFallbackRef.current = onFallback

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/merimee/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.fallback) {
          onFallbackRef.current()
          return
        }
        setResults(data.results ?? [])
        setIsOpen(true)
      } catch {
        onFallbackRef.current()
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleSelect = useCallback((hit: MerimeeHit) => {
    const nom = firstOf(hit._source.titre)
    const commune = firstOf(hit._source.commune)
    const departement = firstOf(hit._source.departement)
    const region = firstOf(hit._source.region)
    const ref_merimee = hit._source.refMerimee ?? hit._id
    const type_protection = mapTypeProtection(hit._source.typeProtection)

    setSelectedLabel(nom)
    setIsOpen(false)
    onSelectRef.current({ nom, commune, departement, region, ref_merimee, type_protection })
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={selectedLabel || query}
        onChange={(e) => {
          setSelectedLabel('')
          setQuery(e.target.value)
        }}
        placeholder="Rechercher un monument (ex : Château de Lyon…)"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        autoComplete="off"
        aria-label="Rechercher un monument"
      />
      {isLoading && (
        <span className="absolute right-3 top-2.5 text-xs text-gray-400">…</span>
      )}
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto text-sm">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-gray-500">
              Aucun résultat — utilisez la saisie manuelle
            </li>
          ) : (
            results.map((hit) => {
              const nom = firstOf(hit._source.titre)
              const commune = firstOf(hit._source.commune)
              return (
                <li
                  key={hit._id}
                  onClick={() => handleSelect(hit)}
                  className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-900">{nom}</span>
                  {commune && <span className="text-gray-500 ml-2 text-xs">{commune}</span>}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
