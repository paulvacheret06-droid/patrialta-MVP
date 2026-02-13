'use client'

import { useState } from 'react'
import type { Template } from '@/lib/s2/types'
import DocumentUploader from './DocumentUploader'
import { deleteDocument } from '@/actions/documents'

interface Document {
  id: string
  type_piece: string
  nom_fichier: string
  statut: string
}

interface ChecklistPiecesProps {
  dossierId: string
  template: Template
  documents: Document[]
}

export default function ChecklistPieces({
  dossierId,
  template,
  documents: initialDocuments,
}: ChecklistPiecesProps) {
  const [documents, setDocuments] = useState(initialDocuments)

  // Dédupliquer toutes les pièces demandées par le template (toutes sections confondues)
  const allPieces = [...new Set(template.sections.flatMap((s) => s.pieces_justificatives))]

  const getDocumentForPiece = (typePiece: string) =>
    documents.find((d) => d.type_piece === typePiece)

  const handleUploaded = (typePiece: string) => (documentId: string) => {
    setDocuments((prev) => [
      ...prev.filter((d) => d.type_piece !== typePiece),
      {
        id: documentId,
        type_piece: typePiece,
        nom_fichier: '',
        statut: 'uploade',
      },
    ])
  }

  const handleDelete = async (documentId: string, typePiece: string) => {
    const result = await deleteDocument(documentId)
    if ('success' in result) {
      setDocuments((prev) => prev.filter((d) => !(d.id === documentId && d.type_piece === typePiece)))
    }
  }

  if (allPieces.length === 0) return null

  const uploadedCount = allPieces.filter((p) => getDocumentForPiece(p)).length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">Pièces justificatives</h2>
        <span className="text-xs text-gray-400">
          {uploadedCount}/{allPieces.length} uploadée{uploadedCount > 1 ? 's' : ''}
        </span>
      </div>
      <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
        {allPieces.map((piece) => {
          const doc = getDocumentForPiece(piece)
          const isUploaded = !!doc

          return (
            <div key={piece} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {isUploaded ? (
                  <span className="flex-shrink-0 text-green-500 text-sm">✓</span>
                ) : (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 truncate">{piece}</p>
                  {isUploaded && doc.nom_fichier && (
                    <p className="text-xs text-gray-400 truncate">{doc.nom_fichier}</p>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                {isUploaded ? (
                  <button
                    onClick={() => handleDelete(doc.id, piece)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Supprimer
                  </button>
                ) : (
                  <DocumentUploader
                    dossierId={dossierId}
                    typePiece={piece}
                    onUploaded={handleUploaded(piece)}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
