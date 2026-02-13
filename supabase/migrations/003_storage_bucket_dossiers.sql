-- ============================================================
-- PatriAlta — Migration 003
-- Bucket Supabase Storage pour les pièces justificatives
-- ============================================================

-- Création du bucket privé (public = false)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dossiers-pieces',
  'dossiers-pieces',
  false,
  10485760, -- 10 MB max par fichier
  array[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- ============================================================
-- RLS sur storage.objects pour le bucket dossiers-pieces
-- ============================================================

-- Lecture : uniquement le propriétaire (user_id dans le path)
create policy "storage: lecture propriétaire"
  on storage.objects for select
  using (
    bucket_id = 'dossiers-pieces'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Upload : uniquement l'utilisateur authentifié dans son dossier
create policy "storage: upload propriétaire"
  on storage.objects for insert
  with check (
    bucket_id = 'dossiers-pieces'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Suppression : uniquement le propriétaire
create policy "storage: suppression propriétaire"
  on storage.objects for delete
  using (
    bucket_id = 'dossiers-pieces'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
