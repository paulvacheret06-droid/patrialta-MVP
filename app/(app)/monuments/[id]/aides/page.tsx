import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { runMatching } from '@/actions/matching'

const TYPE_TRAVAUX_LABELS: Record<string, string> = {
  conservation: 'Conservation',
  restauration: 'Restauration',
  accessibilite: 'Accessibilité',
  etudes: 'Études',
  valorisation: 'Valorisation',
  urgence: 'Urgence',
}
import AideCard from './_components/AideCard'
import CategoryFilter from './_components/CategoryFilter'
import RecalcButton from './_components/RecalcButton'
import SimulateurFinancement from './_components/SimulateurFinancement'
import ExportPdfButton from './_components/ExportPdfButton'
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

const Chevron = () => (
  <svg
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-3.5 h-3.5 text-gray-300 shrink-0"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
      clipRule="evenodd"
    />
  </svg>
)

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
    .select('id, nom, commune, departement, region, type_protection, type_travaux, budget_estime')
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
    <div className="max-w-4xl mx-auto">
      {/* Disclaimer non-contractuel */}
      <div
        className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3.5"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-warning) 6%, white)',
          borderColor: 'color-mix(in srgb, var(--color-warning) 25%, transparent)',
        }}
      >
        <div
          className="shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center"
          style={{ color: 'var(--color-warning)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#92400e' }}>
          <strong>Diagnostic indicatif</strong> — PatriAlta ne garantit pas l&apos;éligibilité finale.
          La décision appartient à l&apos;organisme financeur. Vérifiez les conditions auprès de chaque source officielle.{' '}
          <a href="/legal/cgu" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
            Voir nos CGU
          </a>
          .
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/monuments" className="hover:text-gray-700 transition-colors">
          Monuments
        </Link>
        <Chevron />
        <span className="font-medium text-gray-700">{monument.nom}</span>
        <Chevron />
        <span className="text-gray-900 font-medium">Aides</span>
      </nav>

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Aides éligibles</h1>
        <p className="text-sm text-gray-500 mt-1">
          {monument.nom} · {monument.commune} · {monument.departement}
        </p>
        {results.length > 0 && (
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, white)',
                color: 'var(--color-success)',
              }}
            >
              {eligibleCount} aide{eligibleCount > 1 ? 's' : ''} éligible{eligibleCount > 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400">
              sur {results.length} analysée{results.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
        {monument.type_travaux && monument.type_travaux.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, white)',
                color: '#92400e',
              }}
            >
              Mode projet actif
            </span>
            {monument.type_travaux.map((t: string) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs bg-gray-100 text-gray-600"
              >
                {TYPE_TRAVAUX_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filtres + Actions */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <CategoryFilter categories={CATEGORIES} current={categorie} />
        <div className="flex items-center gap-2">
          {eligibleCount > 0 && <ExportPdfButton monumentId={params.id} />}
          <RecalcButton monumentId={params.id} />
        </div>
      </div>

      {/* Simulateur de financement */}
      {eligibleCount > 0 && (
        <SimulateurFinancement monumentId={params.id} />
      )}

      {/* Liste des aides */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-xl">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-gray-400" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
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
