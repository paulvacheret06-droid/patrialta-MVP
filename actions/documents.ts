'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 Mo

// ────────────────────────────────────────────────────────────────────────────
// uploadDocument
// ────────────────────────────────────────────────────────────────────────────

export async function uploadDocument(formData: FormData): Promise<
  { documentId: string } | { error: string }
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dossierId = formData.get('dossierId') as string
  const typePiece = formData.get('typePiece') as string
  const file = formData.get('file') as File | null

  if (!dossierId || !typePiece || !file) {
    return { error: 'Paramètres manquants.' }
  }

  // Validation MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: 'Format non accepté. Utilisez PDF, DOCX, JPEG ou PNG.' }
  }

  // Validation taille
  if (file.size > MAX_SIZE_BYTES) {
    return { error: 'Fichier trop volumineux (max 10 Mo).' }
  }

  // Vérification ownership du dossier via RLS
  const { data: dossier } = await supabase
    .from('dossiers')
    .select('id')
    .eq('id', dossierId)
    .single()

  if (!dossier) return { error: 'Dossier introuvable ou accès refusé.' }

  // Construction du chemin Supabase Storage
  const ext = file.name.split('.').pop() ?? 'bin'
  const safeFileName = `${typePiece.replace(/[^a-z0-9_-]/gi, '_')}_${Date.now()}.${ext}`
  const storagePath = `${user.id}/${dossierId}/${typePiece}/${safeFileName}`

  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('dossiers-pieces')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return { error: `Erreur lors de l'upload : ${uploadError.message}` }
  }

  // Insertion dans la table documents
  const { data: document, error: insertError } = await supabase
    .from('documents')
    .insert({
      dossier_id: dossierId,
      user_id: user.id,
      type_piece: typePiece,
      nom_fichier: file.name,
      storage_path: storagePath,
      taille_bytes: file.size,
      mime_type: file.type,
      statut: 'uploade',
    })
    .select('id')
    .single()

  if (insertError || !document) {
    // Nettoyage du fichier uploadé si l'insertion échoue
    await supabase.storage.from('dossiers-pieces').remove([storagePath])
    return { error: 'Erreur lors de l\'enregistrement du document.' }
  }

  return { documentId: document.id }
}

// ────────────────────────────────────────────────────────────────────────────
// deleteDocument
// ────────────────────────────────────────────────────────────────────────────

export async function deleteDocument(
  documentId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Non authentifié.' }

  // RLS vérifie ownership — récupération du path pour Storage
  const { data: document } = await supabase
    .from('documents')
    .select('id, storage_path')
    .eq('id', documentId)
    .single()

  if (!document) return { error: 'Document introuvable ou accès refusé.' }

  // Suppression du fichier dans Storage
  if (document.storage_path) {
    await supabase.storage.from('dossiers-pieces').remove([document.storage_path])
  }

  // Suppression de la ligne
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (error) return { error: 'Erreur lors de la suppression.' }

  return { success: true }
}

// ────────────────────────────────────────────────────────────────────────────
// getDocumentSignedUrl
// ────────────────────────────────────────────────────────────────────────────

export async function getDocumentSignedUrl(
  documentId: string
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Non authentifié.' }

  const { data: document } = await supabase
    .from('documents')
    .select('id, storage_path')
    .eq('id', documentId)
    .single()

  if (!document || !document.storage_path) {
    return { error: 'Document introuvable ou accès refusé.' }
  }

  const { data, error } = await supabase.storage
    .from('dossiers-pieces')
    .createSignedUrl(document.storage_path, 60 * 60) // 1 heure

  if (error || !data?.signedUrl) {
    return { error: 'Erreur lors de la génération du lien sécurisé.' }
  }

  return { url: data.signedUrl }
}
