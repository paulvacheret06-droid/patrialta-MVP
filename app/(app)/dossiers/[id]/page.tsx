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

const STATUT_COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-600',
  en_cours: 'bg-amber-100 text-amber-700',
  finalise: 'bg-green-100 text-green-700',
}

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

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/monuments" className="hover:text-gray-600 transition-colors">
          Monuments
        </Link>
        <span>/</span>
        <Link
          href={`/monuments/${monument.id}/aides`}
          className="hover:text-gray-600 transition-colors"
        >
          {monument.nom}
        </Link>
        <span>/</span>
        <span className="text-gray-900">Dossier</span>
      </nav>

      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{aide.nom}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {monument.nom} · {monument.commune} · {monument.departement}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {aide.organisme_nom}
              {deadline && ` · Date limite : ${deadline}`}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-medium ${STATUT_COLORS[dossier.statut] ?? 'bg-gray-100 text-gray-600'}`}
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

      {/* Bouton de génération + exports */}
      <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
        <GenerationButton dossierId={dossier.id} statut={dossier.statut} />
        {Object.keys(sectionsContenu).length > 0 && (
          <ExportButtons dossierId={dossier.id} />
        )}
      </div>

      {/* Sections éditables */}
      {Object.keys(sectionsContenu).length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-sm font-medium text-gray-700">Contenu du dossier</h2>
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
