-- ============================================================
-- PatriAlta — Migration initiale
-- Schéma de base de données + RLS + Index de performance
-- ============================================================

-- Activation de l'extension UUID (disponible par défaut sur Supabase)
-- create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE : profiles
-- Référence auth.users — pas de table public.users
-- ============================================================
create table public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  statut_juridique  text check (statut_juridique in ('collectivite', 'prive', 'association')),
  commune     text,
  region      text,
  nom_commune_officielle  text,
  code_commune_insee      text,
  siren       text,
  telephone   text,
  created_at  timestamptz default now()
);

-- RLS profiles
alter table public.profiles enable row level security;

create policy "profiles: lecture propriétaire" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles: création propriétaire" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles: modification propriétaire" on public.profiles
  for update using (auth.uid() = user_id);

create policy "profiles: suppression propriétaire" on public.profiles
  for delete using (auth.uid() = user_id);


-- ============================================================
-- TABLE : monuments
-- ============================================================
create table public.monuments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  nom             text not null,
  ref_merimee     text,
  is_verified_merimee  boolean default false,
  commune         text not null,
  departement     text not null,
  region          text not null,
  type_protection text check (type_protection in ('classe', 'inscrit', 'spr', 'label_fdp', 'non_protege')),
  epoque          text,
  usage_actuel    text,
  latitude        numeric,
  longitude       numeric,
  description_projet  text,
  type_travaux        text[],
  budget_estime       numeric,
  is_active       boolean default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- RLS monuments
alter table public.monuments enable row level security;

create policy "monuments: lecture propriétaire" on public.monuments
  for select using (auth.uid() = user_id);

create policy "monuments: création propriétaire" on public.monuments
  for insert with check (auth.uid() = user_id);

create policy "monuments: modification propriétaire" on public.monuments
  for update using (auth.uid() = user_id);

create policy "monuments: suppression propriétaire" on public.monuments
  for delete using (auth.uid() = user_id);

-- Index monuments
create index on public.monuments(user_id);
create index on public.monuments(region, departement);


-- ============================================================
-- TABLE : aides
-- Lecture publique — écriture service_role uniquement
-- ============================================================
create table public.aides (
  id              uuid primary key default gen_random_uuid(),
  nom             text not null,
  organisme       text not null,
  type_aide       text check (type_aide in ('subvention', 'pret', 'garantie', 'avantage_fiscal', 'appel_projet')),
  source          text check (source in ('etat', 'region', 'departement', 'fondation', 'europe')),
  categorie       text check (categorie in ('conservation', 'restauration', 'accessibilite', 'etudes', 'valorisation', 'urgence')),
  region_eligible         text,
  departement_eligible    text,
  statut_juridique_eligible   text[],
  type_monument_eligible      text[],
  type_travaux_eligible       text[],
  date_depot_debut    date,
  date_depot_fin      date,
  montant_max         numeric,
  taux_max            numeric,
  plafond_financement_public  numeric,
  regles_cumul        jsonb,
  url_source          text not null,
  external_id         text,
  last_synced_at      timestamptz,
  is_active           boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- RLS aides : lecture publique, écriture service_role uniquement
alter table public.aides enable row level security;

create policy "aides: lecture publique" on public.aides
  for select using (true);

-- Index aides
create index on public.aides(categorie, is_active);
create index on public.aides(region_eligible, departement_eligible);


-- ============================================================
-- TABLE : eligibility_results
-- ============================================================
create table public.eligibility_results (
  id              uuid primary key default gen_random_uuid(),
  monument_id     uuid references public.monuments(id) on delete cascade not null,
  aide_id         uuid references public.aides(id) on delete cascade not null,
  criteres_remplis    jsonb not null default '[]',
  criteres_manquants  jsonb not null default '[]',
  criteres_a_verifier jsonb not null default '[]',
  computed_at     timestamptz default now(),
  unique (monument_id, aide_id)
);

-- RLS eligibility_results via monument ownership
alter table public.eligibility_results enable row level security;

create policy "eligibility_results: lecture via monument" on public.eligibility_results
  for select using (
    exists (
      select 1 from public.monuments m
      where m.id = monument_id and m.user_id = auth.uid()
    )
  );

create policy "eligibility_results: création via monument" on public.eligibility_results
  for insert with check (
    exists (
      select 1 from public.monuments m
      where m.id = monument_id and m.user_id = auth.uid()
    )
  );

-- Index eligibility_results
create index on public.eligibility_results(monument_id);
create index on public.eligibility_results(aide_id);


-- ============================================================
-- TABLE : dossiers
-- ============================================================
create table public.dossiers (
  id              uuid primary key default gen_random_uuid(),
  monument_id     uuid references public.monuments(id) on delete cascade not null,
  aide_id         uuid references public.aides(id) not null,
  user_id         uuid references auth.users(id) on delete cascade not null,
  statut          text check (statut in ('brouillon', 'en_cours', 'finalise')) default 'brouillon',
  contenu_genere  jsonb,
  version         integer default 1,
  prompt_version  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- RLS dossiers
alter table public.dossiers enable row level security;

create policy "dossiers: lecture propriétaire" on public.dossiers
  for select using (auth.uid() = user_id);

create policy "dossiers: création propriétaire" on public.dossiers
  for insert with check (auth.uid() = user_id);

create policy "dossiers: modification propriétaire" on public.dossiers
  for update using (auth.uid() = user_id);

create policy "dossiers: suppression propriétaire" on public.dossiers
  for delete using (auth.uid() = user_id);

-- Index dossiers
create index on public.dossiers(user_id);


-- ============================================================
-- TABLE : documents (pièces justificatives)
-- ============================================================
create table public.documents (
  id                      uuid primary key default gen_random_uuid(),
  dossier_id              uuid references public.dossiers(id) on delete cascade not null,
  nom                     text not null,
  type_piece              text not null,
  supabase_storage_path   text not null,
  statut                  text check (statut in ('manquant', 'uploade', 'valide')) default 'manquant',
  created_at              timestamptz default now()
);

-- RLS documents via dossier ownership
alter table public.documents enable row level security;

create policy "documents: lecture via dossier" on public.documents
  for select using (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  );

create policy "documents: création via dossier" on public.documents
  for insert with check (
    exists (
      select 1 from public.dossiers d
      where d.id = dossier_id and d.user_id = auth.uid()
    )
  );


-- ============================================================
-- TABLE : alerts (veille push)
-- ============================================================
create table public.alerts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  monument_id     uuid references public.monuments(id) on delete cascade not null,
  aide_id         uuid references public.aides(id),
  type            text check (type in ('nouvelle_aide', 'deadline_approche')),
  statut          text check (statut in ('pending', 'sent', 'dismissed')) default 'pending',
  sent_at         timestamptz,
  scheduled_for   timestamptz not null,
  created_at      timestamptz default now()
);

-- RLS alerts
alter table public.alerts enable row level security;

create policy "alerts: lecture propriétaire" on public.alerts
  for select using (auth.uid() = user_id);

create policy "alerts: modification propriétaire" on public.alerts
  for update using (auth.uid() = user_id);

create policy "alerts: suppression propriétaire" on public.alerts
  for delete using (auth.uid() = user_id);

-- Index alerts
create index on public.alerts(user_id, statut);
