import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getTemplate } from '@/lib/templates/index'
import DossierDisclaimer from './_components/DossierDisclaimer'
import DossierProgressBar from './_components/DossierProgressBar'
import GenerationButton from './_components/GenerationButton'
import SectionEditor from './_components/SectionEditor'
import ChecklistPieces from './_components/ChecklistPieces'
import ExportButtons from './_components/ExportButtons'
import type { ContenuDossier } from '@/lib/s2/types'

const STATUT_LABELS: Record<string, string> = {
  brouillon: 'Brouillon',
  en_cours: 'En cours de génération',
  finalise: 'Finalisé',
}

type StatutStyle = { backgroundColor: string; color: string }

function getStatutStyle(statut: string): StatutStyle {
  switch (statut) {
    case 'brouillon':
      return { backgroundColor: '#f3f4f6', color: '#4b5563' }
    case 'en_cours':
      return {
        backgroundColor: 'color-mix(in srgb, var(--color-warning) 12%, white)',
        color: '#92400e',
      }
    case 'finalise':
      return {
        backgroundColor: 'color-mix(in srgb, var(--color-success) 12%, white)',
        color: '#065f46',
      }
    default:
      return { backgroundColor: '#f3f4f6', color: '#4b5563' }
  }
}

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

export default async function DossierPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Chargement dossier + ownership (RLS)
  const { data: dossier } = await supabase
    .from('dossiers')
    .select('id, statut, contenu_genere, created_at, updated_at, monument_id, aide_id')
    .eq('id', params.id)
    .single()

  if (!dossier) notFound()

  // Monument + aide
  const [{ data: monument }, { data: aide }] = await Promise.all([
    supabase
      .from('monuments')
      .select('id, nom, commune, departement, type_protection')
      .eq('id', dossier.monument_id)
      .single(),
    supabase
      .from('aides')
      .select('id, nom, organisme_nom, organisme_id, date_depot_fin')
      .eq('id', dossier.aide_id)
      .single(),
  ])

  if (!monument || !aide) notFound()

  // Documents uploadés
  const { data: documents } = await supabase
    .from('documents')
    .select('id, type_piece, nom_fichier, statut, created_at')
    .eq('dossier_id', dossier.id)

  const template = getTemplate(aide.organisme_id ?? '')
  const contenu = dossier.contenu_genere as ContenuDossier | null
  const sectionsContenu = contenu ? (contenu as unknown as Record<string, { contenu: string; is_edite: boolean }>) : {}

  const deadline = aide.date_depot_fin
    ? new Date(aide.date_depot_fin).toLocaleDateString('fr-FR')
    : null

  const statutStyle = getStatutStyle(dossier.statut)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/monuments" className="hover:text-gray-700 transition-colors">
          Monuments
        </Link>
        <Chevron />
        <Link
          href={`/monuments/${monument.id}/aides`}
          className="hover:text-gray-700 transition-colors"
        >
          {monument.nom}
        </Link>
        <Chevron />
        <span className="text-gray-900 font-medium">Dossier</span>
      </nav>

      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{aide.nom}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {monument.nom} · {monument.commune} · {monument.departement}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {aide.organisme_nom}
              {deadline && (
                <>
                  {' · '}
                  <span>Date limite : {deadline}</span>
                </>
              )}
            </p>
          </div>
          <span
            className="inline-flex items-center shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            style={statutStyle}
          >
            {STATUT_LABELS[dossier.statut] ?? dossier.statut}
          </span>
        </div>
      </div>

      {/* Disclaimer permanent */}
      <DossierDisclaimer />

      {/* Progression */}
      <div className="mt-5">
        <DossierProgressBar
          template={template}
          sectionsContenu={sectionsContenu}
          documents={documents ?? []}
        />
      </div>

      {/* Génération + exports */}
      <div
        className="mt-5 flex items-center justify-between gap-4 flex-wrap bg-white border border-gray-200 rounded-xl px-5 py-4"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <GenerationButton dossierId={dossier.id} statut={dossier.statut} />
        {Object.keys(sectionsContenu).length > 0 && (
          <ExportButtons dossierId={dossier.id} />
        )}
      </div>

      {/* Sections éditables */}
      {Object.keys(sectionsContenu).length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Contenu du dossier
          </h2>
          {template.sections.map((section) => {
            const sectionData = sectionsContenu[section.id]
            return (
              <SectionEditor
                key={section.id}
                dossierId={dossier.id}
                sectionId={section.id}
                titre={section.titre}
                contenuInitial={sectionData?.contenu ?? ''}
                isEdite={sectionData?.is_edite ?? false}
                obligatoire={section.obligatoire}
              />
            )
          })}
        </div>
      )}

      {/* Checklist pièces justificatives */}
      <div className="mt-8">
        <ChecklistPieces
          dossierId={dossier.id}
          template={template}
          documents={documents ?? []}
        />
      </div>
    </div>
  )
}
