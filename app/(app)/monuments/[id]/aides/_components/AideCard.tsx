import type { Aide, CritereResult } from '@/lib/s1/types'
import DossierCTAButton from './DossierCTAButton'

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

const CATEGORIE_LABELS: Record<string, string> = {
  conservation: 'Conservation',
  restauration: 'Restauration',
  accessibilite: 'Accessibilité',
  etudes: 'Études',
  valorisation: 'Valorisation',
  urgence: 'Urgence',
}

const SOURCE_LABELS: Record<string, string> = {
  etat: 'État',
  region: 'Région',
  departement: 'Département',
  fondation: 'Fondation',
  europe: 'Europe',
}

function StatutBadge({ statut }: { statut: 'eligible' | 'non_eligible' | 'incomplet' }) {
  if (statut === 'eligible') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
        ✓ Éligible
      </span>
    )
  }
  if (statut === 'non_eligible') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
        ✗ Non éligible
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-500/20">
      ? À vérifier
    </span>
  )
}

function computeStatut(row: AideResultRow): 'eligible' | 'non_eligible' | 'incomplet' {
  if (row.criteres_manquants.length > 0) return 'non_eligible'
  if (row.criteres_a_verifier.length > 0) return 'incomplet'
  return 'eligible'
}

export default function AideCard({ result }: { result: AideResultRow }) {
  const { aide } = result
  const statut = computeStatut(result)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-medium text-gray-900">{aide.nom}</h3>
          </div>
          <p className="text-xs text-gray-500">
            {aide.organisme}
            {' · '}
            <span className="text-gray-400">{SOURCE_LABELS[aide.source] ?? aide.source}</span>
            {' · '}
            <span className="text-gray-400">{CATEGORIE_LABELS[aide.categorie] ?? aide.categorie}</span>
          </p>
        </div>
        <div className="flex-shrink-0">
          <StatutBadge statut={statut} />
        </div>
      </div>

      {/* Montant / taux */}
      {(aide.montant_max || aide.taux_max) && (
        <p className="text-xs text-gray-600 mt-2">
          {aide.taux_max && (
            <span>Taux max : {Math.round(aide.taux_max * 100)}%</span>
          )}
          {aide.taux_max && aide.montant_max && <span> · </span>}
          {aide.montant_max && (
            <span>Plafond : {aide.montant_max.toLocaleString('fr-FR')} €</span>
          )}
        </p>
      )}

      {/* Critères */}
      <div className="mt-3 space-y-1">
        {result.criteres_remplis.map((c, i) => (
          <p key={i} className="flex items-start gap-1.5 text-xs text-green-700">
            <span className="mt-0.5 flex-shrink-0">✓</span>
            <span>{c.critere.label_humain}</span>
          </p>
        ))}
        {result.criteres_manquants.map((c, i) => (
          <p key={i} className="flex items-start gap-1.5 text-xs text-red-600">
            <span className="mt-0.5 flex-shrink-0">✗</span>
            <span>{c.critere.label_humain}</span>
          </p>
        ))}
        {result.criteres_a_verifier.map((c, i) => (
          <p key={i} className="flex items-start gap-1.5 text-xs text-orange-600">
            <span className="mt-0.5 flex-shrink-0">?</span>
            <span>{c.critere.label_humain}</span>
          </p>
        ))}
        {result.criteres_remplis.length === 0 &&
          result.criteres_manquants.length === 0 &&
          result.criteres_a_verifier.length === 0 && (
            <p className="text-xs text-gray-400 italic">Aucun critère spécifique renseigné.</p>
          )}
      </div>

      {/* Footer : source + CTA dossier */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        {aide.url_source ? (
          <a
            href={aide.url_source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Voir la source officielle →
          </a>
        ) : (
          <span />
        )}

        {/* CTA dossier — uniquement pour les aides éligibles */}
        {statut === 'eligible' && (
          <DossierCTAButton monumentId={result.monument_id} aideId={result.aide_id} />
        )}
      </div>
    </div>
  )
}
