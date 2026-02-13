'use client'

import { useRef, useState } from 'react'
import { uploadDocument } from '@/actions/documents'

const ALLOWED_EXTENSIONS = '.pdf,.docx,.jpg,.jpeg,.png'
const MAX_SIZE_MB = 10

interface DocumentUploaderProps {
  dossierId: string
  typePiece: string
  onUploaded: (documentId: string) => void
}

export default function DocumentUploader({
  dossierId,
  typePiece,
  onUploaded,
}: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation côté client
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setError('Format non accepté. Utilisez PDF, DOCX, JPEG ou PNG.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`)
      return
    }

    setError(null)
    setIsUploading(true)

    const formData = new FormData()
    formData.append('dossierId', dossierId)
    formData.append('typePiece', typePiece)
    formData.append('file', file)

    const result = await uploadDocument(formData)

    if ('error' in result) {
      setError(result.error)
    } else {
      onUploaded(result.documentId)
    }

    setIsUploading(false)
    // Reset input pour permettre le re-upload du même fichier
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS}
        onChange={handleFileChange}
        className="hidden"
        id={`upload-${dossierId}-${typePiece}`}
      />
      <label
        htmlFor={`upload-${dossierId}-${typePiece}`}
        className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors
          ${isUploading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800'
          }`}
      >
        {isUploading ? (
          <>
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Upload…
          </>
        ) : (
          'Uploader'
        )}
      </label>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
