-- ============================================================
-- PatriAlta — Seed initial : catalogue d'aides (10 aides MVP)
-- Régions pilotes : Auvergne-Rhône-Alpes + Aube
-- ============================================================

insert into public.aides (
  nom, organisme, type_aide, source, categorie,
  region_eligible, departement_eligible,
  statut_juridique_eligible, type_monument_eligible, type_travaux_eligible,
  taux_max, plafond_financement_public, montant_max,
  regles_cumul, url_source, is_active
) values

-- ── État / DRAC ───────────────────────────────────────────────────────────────

(
  'Subvention DRAC — Restauration MH classés',
  'DRAC (Ministère de la Culture)',
  'subvention', 'etat', 'restauration',
  null, null,
  array['collectivite','prive','association'],
  array['classe'],
  array[]::text[],
  0.5, 0.8, null,
  '{"plafond_financement_public":80,"cumulable_avec":["region_aura_patrimoine"],"notes":"Taux majoré possible pour les monuments en péril."}'::jsonb,
  'https://www.culturecommunication.gouv.fr/Thematiques/Patrimoine/Monuments-historiques/Aides-a-la-restauration-des-monuments-historiques',
  true
),

(
  'Subvention DRAC — Restauration MH inscrits',
  'DRAC (Ministère de la Culture)',
  'subvention', 'etat', 'restauration',
  null, null,
  array['collectivite','prive','association'],
  array['inscrit'],
  array[]::text[],
  0.4, 0.8, null,
  '{"plafond_financement_public":80}'::jsonb,
  'https://www.culturecommunication.gouv.fr/Thematiques/Patrimoine/Monuments-historiques/Aides-a-la-restauration-des-monuments-historiques',
  true
),

(
  'FSIL — Fonds de Soutien à l''Investissement Local (volet patrimoine)',
  'Préfecture / DRAC',
  'subvention', 'etat', 'conservation',
  null, null,
  array['collectivite'],
  array['classe','inscrit'],
  array[]::text[],
  0.8, 0.8, null,
  '{"plafond_financement_public":80,"notes":"Réservé aux collectivités locales."}'::jsonb,
  'https://www.prefectures-regions.gouv.fr/auvergne-rhone-alpes/Section-actualites/Fonds-de-soutien-a-l-investissement-local',
  true
),

-- ── Région Auvergne-Rhône-Alpes ───────────────────────────────────────────────

(
  'Aide régionale au patrimoine — AuRA',
  'Région Auvergne-Rhône-Alpes',
  'subvention', 'region', 'restauration',
  'Auvergne-Rhône-Alpes', null,
  array['collectivite','association'],
  array['classe','inscrit','spr'],
  array[]::text[],
  0.4, 0.8, 150000,
  '{"plafond_financement_public":80}'::jsonb,
  'https://www.auvergnerhonealpes.fr/aide/patrimoine-historique',
  true
),

(
  'Aide au patrimoine rural non protégé — AuRA',
  'Région Auvergne-Rhône-Alpes',
  'subvention', 'region', 'conservation',
  'Auvergne-Rhône-Alpes', null,
  array['collectivite'],
  array['spr','label_fdp','non_protege'],
  array[]::text[],
  0.3, 0.8, 50000,
  null,
  'https://www.auvergnerhonealpes.fr/aide/patrimoine-rural',
  true
),

-- ── Fondation du Patrimoine ────────────────────────────────────────────────────

(
  'Fondation du Patrimoine — Label (souscription publique)',
  'Fondation du Patrimoine',
  'appel_projet', 'fondation', 'restauration',
  null, null,
  array['prive','association'],
  array['label_fdp','non_protege'],
  array[]::text[],
  null, null, null,
  '{"notes":"Le label ouvre à la déduction fiscale pour les donateurs."}'::jsonb,
  'https://www.fondation-patrimoine.org/les-aides/le-label',
  true
),

(
  'Fondation du Patrimoine — Mission Patrimoine (Loto du Patrimoine)',
  'Fondation du Patrimoine / Mission Stéphane Bern',
  'subvention', 'fondation', 'restauration',
  null, null,
  array['collectivite','prive','association'],
  array['classe','inscrit','spr','label_fdp'],
  array[]::text[],
  null, null, null,
  '{"notes":"Sélection nationale annuelle sur dossier."}'::jsonb,
  'https://www.fondation-patrimoine.org/les-aides/mission-patrimoine',
  true
),

-- ── Fondations privées ────────────────────────────────────────────────────────

(
  'VMF — Aide à la restauration du patrimoine privé',
  'Vieilles Maisons Françaises (VMF)',
  'subvention', 'fondation', 'restauration',
  null, null,
  array['prive','association'],
  array['classe','inscrit'],
  array[]::text[],
  null, null, 10000,
  null,
  'https://www.vmf.net/aides',
  true
),

(
  'Sauvegarde de l''Art Français — Aide à la restauration',
  'Sauvegarde de l''Art Français',
  'subvention', 'fondation', 'restauration',
  null, null,
  array['collectivite','association'],
  array['classe','inscrit'],
  array['mobilier','vitraux','sculpture'],
  null, null, 15000,
  '{"notes":"Priorité aux mobiliers et objets d''art religieux."}'::jsonb,
  'https://www.sauvegardeartfrancais.fr/aides',
  true
),

-- ── Europe ────────────────────────────────────────────────────────────────────

(
  'FEDER — Volet patrimoine et développement territorial',
  'Union Européenne / Région AuRA',
  'subvention', 'europe', 'conservation',
  'Auvergne-Rhône-Alpes', null,
  array['collectivite'],
  array['classe','inscrit'],
  array[]::text[],
  0.5, 0.8, 500000,
  '{"plafond_financement_public":80,"notes":"Obligation de co-financement local minimum 20%."}'::jsonb,
  'https://www.auvergnerhonealpes.eu/feder',
  true
)

on conflict do nothing;
