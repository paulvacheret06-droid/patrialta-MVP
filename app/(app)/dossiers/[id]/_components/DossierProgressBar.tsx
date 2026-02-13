import type { Template } from '@/lib/s2/types'

interface Document {
  id: string
  type_piece: string
  statut: string
}

interface DossierProgressBarProps {
  template: Template
  sectionsContenu: Record<string, { contenu: string; is_edite: boolean }>
  documents: Document[]
}

export default function DossierProgressBar({
  template,
  sectionsContenu,
  documents,
}: DossierProgressBarProps) {
  const obligatorySections = template.sections.filter((s) => s.obligatoire)
  const sectionsCompletes = obligatorySections.filter(
    (s) => sectionsContenu[s.id]?.contenu && sectionsContenu[s.id].contenu.trim().length > 0
  )

  // Pièces obligatoires = toutes les pièces listées dans les sections obligatoires
  const piecesObligatoires = obligatorySections.flatMap((s) => s.pieces_justificatives)
  const piecesUploadees = documents.filter((d) => d.statut === 'uploade' || d.statut === 'valide')

  const totalItems = obligatorySections.length + piecesObligatoires.length
  const completedItems = sectionsCompletes.length + Math.min(piecesUploadees.length, piecesObligatoires.length)

  const pct = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

  const getMessage = () => {
    if (pct === 100) return 'Dossier complet — prêt à finaliser'
    if (sectionsCompletes.length === 0) return 'Commencez par générer le contenu du dossier'
    if (sectionsCompletes.length < obligatorySections.length)
      return `${sectionsCompletes.length}/${obligatorySections.length} sections générées`
    return `Sections complètes · ${piecesUploadees.length}/${piecesObligatoires.length} pièces uploadées`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">{getMessage()}</span>
        <span className="text-xs font-medium text-gray-700">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-stone-700'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
