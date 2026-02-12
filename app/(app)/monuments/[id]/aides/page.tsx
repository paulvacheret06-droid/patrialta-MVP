import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { runMatching } from '@/actions/matching'
import AideCard from './_components/AideCard'
import CategoryFilter from './_components/CategoryFilter'
import RecalcButton from './_components/RecalcButton'
import type { Aide, CritereResult } from '@/lib/s1/types'

type AideResultRow = {
  id: string
  monument_id: string
  aide_id: string
  criteres_remplis: CritereResult[]
  criteres_manquants: CritereResult[]
  criteres_a_verifier: CritereResult[]
  computed_at: string
  aide: Aide
}

const CATEGORIES = [
  'conservation',
  'restauration',
  'accessibilite',
  'etudes',
  'valorisation',
  'urgence',
]

export default async function AidesPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ categorie?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Vérification ownership du monument (RLS)
  const { data: monument } = await supabase
    .from('monuments')
    .select('id, nom, commune, departement, region, type_protection')
    .eq('id', params.id)
    .single()

  if (!monument) notFound()

  // Chargement des résultats existants
  const { data: rawResults } = await supabase
    .from('eligibility_results')
    .select('id, monument_id, aide_id, criteres_remplis, criteres_manquants, criteres_a_verifier, computed_at, aide:aides(*)')
    .eq('monument_id', params.id)

  // Si aucun résultat, lancer le matching automatiquement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let results: AideResultRow[] = (rawResults as unknown as AideResultRow[]) ?? []
  if (results.length === 0) {
    try {
      await runMatching(params.id)
      const { data: freshResults } = await supabase
        .from('eligibility_results')
        .select('id, monument_id, aide_id, criteres_remplis, criteres_manquants, criteres_a_verifier, computed_at, aide:aides(*)')
        .eq('monument_id', params.id)
      results = (freshResults as unknown as AideResultRow[]) ?? []
    } catch {
      // Le matching a échoué (ex. aucune aide en base) — on continue avec liste vide
    }
  }

  // Filtre par catégorie via URL param
  const { categorie } = searchParams
  const filtered = categorie
    ? results.filter((r) => r.aide?.categorie === categorie)
    : results

  // Tri : éligibles → à vérifier → non éligibles
  const sorted = [...filtered].sort((a, b) => {
    const order = { eligible: 0, incomplet: 1, non_eligible: 2 }
    const getStatut = (r: AideResultRow) => {
      if (r.criteres_manquants.length > 0) return 'non_eligible'
      if (r.criteres_a_verifier.length > 0) return 'incomplet'
      return 'eligible'
    }
    return order[getStatut(a)] - order[getStatut(b)]
  })

  const eligibleCount = results.filter(
    (r) => r.criteres_manquants.length === 0 && r.criteres_a_verifier.length === 0
  ).length

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/monuments" className="hover:text-gray-600 transition-colors">
          Monuments
        </Link>
        <span>/</span>
        <span className="text-gray-600">{monument.nom}</span>
        <span>/</span>
        <span className="text-gray-900">Aides</span>
      </nav>

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Aides éligibles</h1>
        <p className="text-sm text-gray-500 mt-1">
          {monument.nom} · {monument.commune} · {monument.departement}
        </p>
        {results.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {eligibleCount} aide{eligibleCount > 1 ? 's' : ''} éligible{eligibleCount > 1 ? 's' : ''} sur {results.length}
          </p>
        )}
      </div>

      {/* Filtres + Recalculer */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <CategoryFilter categories={CATEGORIES} current={categorie} />
        <RecalcButton monumentId={params.id} />
      </div>

      {/* Liste des aides */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-sm text-gray-500 mb-1">
            {categorie ? 'Aucune aide dans cette catégorie.' : 'Aucune aide trouvée.'}
          </p>
          {!categorie && (
            <p className="text-xs text-gray-400">
              Assurez-vous que la migration de seed a été appliquée dans Supabase.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => (
            <AideCard key={r.id} result={r} />
          ))}
        </div>
      )}
    </div>
  )
}
