-- ============================================================
-- Migration 004 — Ajout du champ rgpd_consent_at sur profiles
-- Appliquer via Supabase Dashboard > SQL Editor
-- ============================================================

alter table public.profiles
  add column if not exists rgpd_consent_at timestamptz null;

comment on column public.profiles.rgpd_consent_at is
  'Date et heure UTC de l''acceptation des CGU et de la politique de confidentialité (RGPD). NULL pour les comptes créés avant T6.';
