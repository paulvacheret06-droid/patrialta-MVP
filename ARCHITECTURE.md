# Architecture Technique — PatriAlta MVP

## Vue d'ensemble

PatriAlta est une SaaS B2B Next.js full-stack composée de deux services :
- **S1 — Mouline** : moteur d'identification des aides financières (matching déterministe)
- **S2 — Montage** : générateur de dossiers de subvention assisté par IA (Claude API)

---

## Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js (App Router) | 15.x |
| Langage | TypeScript | strict |
| Base de données | Supabase (PostgreSQL) — Frankfurt EU | latest (épingler avant 1er commit) |
| Auth | Supabase Auth | inclus |
| Storage | Supabase Storage | inclus |
| ORM / accès données | Supabase TypeScript SDK (types auto-générés) | latest (épingler avant 1er commit) |
| Hébergement | Vercel **Pro** (région EU — Frankfurt) | — |
| Email | Brevo (ex-Sendinblue) | API v3 |
| Génération PDF | @react-pdf/renderer | latest (épingler — incompatible Edge Runtime, voir note) |
| Génération Word | docx (npm) | latest (épingler avant 1er commit) |
| IA — rédaction S2 | Claude API (Anthropic) | claude-sonnet-4-5-20250929 / claude-opus-4-6 |
| Matching S1 | TypeScript pur (logique déterministe) | — |
| Cron jobs | Vercel Cron (**plan Pro requis** — 2 jobs) | — |
| Cache API | Next.js fetch cache natif (revalidate) | — |
| Styling | Tailwind CSS + shadcn/ui | — |
| Monitoring erreurs | Sentry (ou équivalent) | — |

> **Note versions** : épingler toutes les dépendances dans `package.json` avant le premier commit. Supabase SDK a eu des breaking changes entre v1 et v2 ; `@react-pdf/renderer` et `docx` ont également eu des changements non rétrocompatibles.

> **Note modèles Claude** : utiliser les identifiants de version complets (`claude-sonnet-4-5-20250929`, pas l'alias court) pour garantir la stabilité du comportement en production.

> **Note Vercel Cron** : le plan Free ne supporte qu'un seul cron job. Le projet nécessite deux (`sync-aides` + `send-alerts`). **Plan Pro obligatoire dès le départ.**

> **Note @react-pdf/renderer** : incompatible avec le Edge Runtime Vercel. Les routes qui génèrent des PDFs doivent impérativement déclarer `export const runtime = 'nodejs'`.

---

## Architecture des services

### S1 — Mouline (moteur d'éligibilité)

**Principe** : logique déterministe pure, aucun LLM. Résultats factuels uniquement.

Flux :
1. L'utilisateur saisit son monument → autocomplétion via API Mérimée (proxy Next.js avec cache fetch)
2. Pour les monuments hors Mérimée → saisie manuelle (localisation, type, protection, époque, usage)
   - La saisie manuelle doit être accessible directement depuis l'UI, pas seulement en fallback
3. Filtrage géographique automatique des aides (national + région + département)
4. Le moteur TypeScript croise les données monument × critères des aides :
   - ✓ critère rempli
   - ✗ critère non rempli
   - ? donnée manquante → demande de précision à l'utilisateur
5. Affichage des aides éligibles avec liens sources officielles, deadlines, règles de cumul
6. Mode généraliste (par défaut) ou mode projet (travaux précisés)
7. Simulateur de financement : coût travaux → combinaisons d'aides possibles avec plafonds
   - **La logique de calcul du simulateur est une Server Action**, pas du code client-side

**Veille push** : Vercel Cron (1x/jour) compare les nouvelles aides Aides-territoires avec les profils monuments sauvegardés → alertes email Brevo.

### S2 — Montage de dossiers

**Principe** : Claude API pour la rédaction, validation humaine obligatoire avant export.

Flux :
1. Sélection d'une aide éligible (depuis S1)
2. Pré-remplissage automatique depuis les données monument (S1)
3. Génération du dossier via Claude API (streaming SSE, affichage progressif)
   - Le contenu est sauvegardé en chunks dans `contenu_genere` au fil du streaming
   - Stratégie de retry : 3 tentatives avec backoff exponentiel en cas d'erreur 529/500
4. Édition libre par l'utilisateur (champs non verrouillés)
5. Upload des pièces justificatives (Supabase Storage)
6. Checklist dynamique des pièces par organisme
7. Export PDF (React-PDF) ou DOCX (docx npm) — dossier prêt à envoyer

---

## Modèle de données (tables principales)

> **Important** : il n'y a **pas** de table `public.users`. Supabase Auth gère déjà `auth.users`. Toutes les clés étrangères `user_id` référencent `auth.users(id)` avec `ON DELETE CASCADE`.

```sql
-- Pas de table public.users — on utilise auth.users directement

profiles
  id          uuid primary key default gen_random_uuid()
  user_id     uuid references auth.users(id) on delete cascade unique not null
  statut_juridique  text check (statut_juridique in ('collectivite', 'prive', 'association'))
  commune     text
  region      text
  nom_commune_officielle  text
  code_commune_insee      text        -- Code INSEE commune
  siren       text                    -- Requis pour certains dossiers de subvention
  telephone   text
  created_at  timestamptz default now()

monuments
  id              uuid primary key default gen_random_uuid()
  user_id         uuid references auth.users(id) on delete cascade not null
  nom             text not null
  ref_merimee     text                -- nullable si saisie manuelle
  is_verified_merimee  boolean default false  -- true = données issues de l'API Mérimée
  commune         text not null
  departement     text not null
  region          text not null
  type_protection text check (type_protection in ('classe', 'inscrit', 'spr', 'label_fdp', 'non_protege'))
  epoque          text
  usage_actuel    text
  latitude        numeric
  longitude       numeric
  -- Champs mode projet (optionnel, remplis si l'utilisateur précise un projet)
  description_projet  text
  type_travaux        text[]          -- ex: ['conservation', 'restauration']
  budget_estime       numeric
  is_active       boolean default true
  created_at      timestamptz default now()
  updated_at      timestamptz default now()

aides
  id              uuid primary key default gen_random_uuid()
  nom             text not null
  organisme       text not null
  type_aide       text check (type_aide in ('subvention', 'pret', 'garantie', 'avantage_fiscal', 'appel_projet'))
  source          text check (source in ('etat', 'region', 'departement', 'fondation', 'europe'))
  categorie       text check (categorie in ('conservation', 'restauration', 'accessibilite', 'etudes', 'valorisation', 'urgence'))
  region_eligible         text
  departement_eligible    text
  statut_juridique_eligible   text[]  -- ex: ['collectivite', 'association']
  type_monument_eligible      text[]
  type_travaux_eligible       text[]
  date_depot_debut    date
  date_depot_fin      date
  montant_max         numeric
  taux_max            numeric         -- ex: 0.80 pour 80%
  plafond_financement_public  numeric -- ex: 0.80 pour 80%
  regles_cumul        jsonb           -- structure définie ci-dessous
  url_source          text not null
  external_id         text            -- id Aides-territoires si applicable
  last_synced_at      timestamptz
  is_active           boolean default true  -- false = aide fermée, non supprimée
  created_at          timestamptz default now()
  updated_at          timestamptz default now()

-- Structure regles_cumul (jsonb typé) :
-- {
--   "plafond_financement_public": 0.80,
--   "cumulable_avec": ["aide_etat", "aide_region"],
--   "non_cumulable_avec": ["aide_x"],
--   "notes": "texte libre pour règles complexes"
-- }

eligibility_results
  id              uuid primary key default gen_random_uuid()
  monument_id     uuid references monuments(id) on delete cascade not null
  aide_id         uuid references aides(id) on delete cascade not null
  criteres_remplis    jsonb not null default '[]'
  criteres_manquants  jsonb not null default '[]'
  criteres_a_verifier jsonb not null default '[]'
  computed_at     timestamptz default now()
  unique (monument_id, aide_id)     -- ON CONFLICT DO UPDATE pour éviter les doublons

dossiers
  id              uuid primary key default gen_random_uuid()
  monument_id     uuid references monuments(id) on delete cascade not null
  aide_id         uuid references aides(id) not null
  user_id         uuid references auth.users(id) on delete cascade not null
  statut          text check (statut in ('brouillon', 'en_cours', 'finalise')) default 'brouillon'
  contenu_genere  jsonb               -- structure ContenuDossier définie ci-dessous
  version         integer default 1  -- incrémenté à chaque régénération (dernière version conservée)
  prompt_version  text                -- version du prompt Claude utilisé (ex: 'drac-v1.2')
  created_at      timestamptz default now()
  updated_at      timestamptz default now()

-- Structure contenu_genere (jsonb typé — type TypeScript ContenuDossier) :
-- {
--   "sections": [
--     {
--       "id": "presentation_monument",
--       "titre": "Présentation du monument",
--       "contenu": "...",
--       "is_edite": false
--     }
--   ],
--   "generated_at": "2025-01-01T00:00:00Z",
--   "is_complete": true
-- }

documents
  id                      uuid primary key default gen_random_uuid()
  dossier_id              uuid references dossiers(id) on delete cascade not null
  nom                     text not null
  type_piece              text not null
  supabase_storage_path   text not null
  statut                  text check (statut in ('manquant', 'uploade', 'valide')) default 'manquant'
  created_at              timestamptz default now()

alerts
  id              uuid primary key default gen_random_uuid()
  user_id         uuid references auth.users(id) on delete cascade not null
  monument_id     uuid references monuments(id) on delete cascade not null
  aide_id         uuid references aides(id)
  type            text check (type in ('nouvelle_aide', 'deadline_approche'))
  statut          text check (statut in ('pending', 'sent', 'dismissed')) default 'pending'
  sent_at         timestamptz
  scheduled_for   timestamptz not null
  created_at      timestamptz default now()
```

---

## Infrastructure

```
[Navigateur]
    │
    ▼
[Vercel Pro — Frankfurt EU]
    Next.js 15 App Router
    ├── Server Components (rendu données)
    ├── Client Components (autocomplete, upload, simulateur UI)
    ├── Route Handlers (/api/*)
    │     ├── /api/merimee/search       → API Mérimée (cache fetch 24h)
    │     │     └── fallback : message "saisie manuelle" si API indisponible
    │     ├── /api/aides/sync           → Aides-territoires (Vercel Cron, protégée CRON_SECRET)
    │     └── /api/dossiers/generate    → Claude API streaming (protégée JWT + ownership + rate limit)
    │           export const runtime = 'nodejs'  ← obligatoire
    ├── Server Actions (CRUD monuments, profils, alertes, simulateur de financement)
    └── Vercel Cron (plan Pro)
          ├── sync-aides     : 0 3 * * *  (quotidien, 3h)
          └── send-alerts    : 0 8 * * *  (quotidien, 8h)
    │
    ▼
[Supabase — Frankfurt EU]
    ├── PostgreSQL (données app + RLS)
    ├── Auth (JWT sessions + sessions anonymes pour onboarding)
    └── Storage (pièces justificatives S2)
          └── Politique bucket : PDF/DOCX/JPEG/PNG uniquement, taille max 10Mo
    │
    ▼
[Services externes]
    ├── API Mérimée (api.pop.culture.gouv.fr) — publique, sans clé
    ├── Aides-territoires (aides-territoires.beta.gouv.fr) — clé API
    ├── Claude API (Anthropic) — S2 uniquement, DPA signé obligatoire
    └── Brevo (emails transactionnels)
```

---

## APIs externes

### Base Mérimée
- **URL** : `https://api.pop.culture.gouv.fr/maison/merimee`
- **Usage** : autocomplétion monument, récupération données officielles
- **Auth** : publique (aucune clé)
- **Cache** : Next.js `fetch` avec `revalidate: 86400` (24h)
- **Fallback** : si le cache est expiré et l'API indisponible → message UI "autocomplétion temporairement indisponible, utilisez la saisie manuelle". Ne jamais retourner une erreur 500 à l'utilisateur.

### Aides-territoires
- **URL** : `https://aides-territoires.beta.gouv.fr/api/`
- **Usage** : sync quotidienne des aides publiques (filtre thématique patrimoine)
- **Auth** : clé API (`AIDES_TERRITOIRES_API_KEY`)
- **Stratégie** : polling Vercel Cron 1x/jour, stockage local dans Supabase
- **Validation** : chaque objet reçu de l'API est validé via **Zod** avant insertion en base
- **Diff** : ne mettre à jour en base que les aides modifiées ; mettre à jour `last_synced_at` pour toutes
- **Alerte** : si la sync échoue, envoyer un email d'alerte (Brevo) à l'admin

### Claude API
- **Usage** : génération des dossiers de subvention (S2 uniquement — jamais pour le matching S1)
- **Modèles** : `claude-sonnet-4-5-20250929` (standard) / `claude-opus-4-6` (dossiers complexes)
- **Auth** : `ANTHROPIC_API_KEY`
- **Pattern** : streaming SSE via Route Handler Next.js (`runtime = 'nodejs'`)
- **Retry** : 3 tentatives avec backoff exponentiel sur erreurs 529/500
- **RGPD** : **DPA (Data Processing Agreement) Anthropic obligatoire** avant toute mise en production avec données réelles. Les données personnelles directement identifiantes (nom complet, SIREN, adresse précise) doivent être minimisées dans les prompts.

---

## Principes de développement

### Matching S1 — règle absolue
Le moteur d'éligibilité est **100% déterministe, TypeScript pur**. Aucun LLM, aucun appel à Claude pour calculer l'éligibilité. Les critères sont évalués programmatiquement depuis les données structurées en base. Objectif : résultats reproductibles, testables unitairement, sans hallucination.

**Structure du moteur de matching** (interfaces à définir avant de coder) :

```typescript
// Critère d'éligibilité élémentaire
interface Critere {
  champ: string
  operateur: 'eq' | 'in' | 'gte' | 'lte' | 'contains' | 'not_null'
  valeur: unknown
  label_humain: string  // ex: "Type de protection : classé ou inscrit"
}

// Résultat d'évaluation d'un critère
interface CritereResult {
  critere: Critere
  statut: 'rempli' | 'non_rempli' | 'a_verifier'
  valeur_monument?: unknown
}

// Résultat complet pour un couple monument × aide
interface ResultatEligibilite {
  monument_id: string
  aide_id: string
  statut: 'eligible' | 'non_eligible' | 'incomplet'
  criteres_remplis: CritereResult[]
  criteres_manquants: CritereResult[]
  criteres_a_verifier: CritereResult[]
}

// Fonction pure, testable unitairement
function evaluerEligibilite(monument: Monument, aide: Aide): ResultatEligibilite
```

### Interfaces TypeScript critiques (à définir avant tout code applicatif)

```typescript
// Structure du contenu généré par Claude
interface ContenuDossier {
  sections: {
    id: string
    titre: string
    contenu: string
    is_edite: boolean  // true si l'utilisateur a modifié manuellement
  }[]
  generated_at: string
  is_complete: boolean
}

// Structure d'un template de dossier par organisme
interface Template {
  organisme_id: string
  organisme_nom: string
  sections: {
    id: string
    titre: string
    instructions_prompt: string  // instructions pour Claude
    obligatoire: boolean
    pieces_justificatives: string[]
  }[]
  prompt_version: string
}

// Règles de cumul structurées
interface ReglesCumul {
  plafond_financement_public?: number  // ex: 0.80
  cumulable_avec?: string[]
  non_cumulable_avec?: string[]
  notes?: string
}
```

### Sécurité multi-tenant
Row Level Security (RLS) PostgreSQL natif via Supabase. Chaque utilisateur n'accède qu'à ses propres monuments et dossiers, sans middleware applicatif.

### Politiques RLS (à écrire en migration SQL avant tout code applicatif)

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` |
| `monuments` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` |
| `aides` | **public** (lecture seule) | service_role uniquement | service_role uniquement | service_role uniquement |
| `eligibility_results` | via monument ownership | via monument ownership | via monument ownership | via monument ownership |
| `dossiers` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` | `user_id = auth.uid()` |
| `documents` | via dossier ownership | via dossier ownership | via dossier ownership | via dossier ownership |
| `alerts` | `user_id = auth.uid()` | service_role uniquement | `user_id = auth.uid()` | `user_id = auth.uid()` |

> **Règle absolue** : les Server Actions ordinaires utilisent le client Supabase avec le JWT de l'utilisateur (RLS actif). Seuls les cron jobs et webhooks internes utilisent le client `service_role`.

### Sécurité des routes critiques

**`/api/dossiers/generate`** (coût réel par token Anthropic) :
1. Vérification JWT Supabase obligatoire avant tout appel Claude
2. Vérification en base que le `dossier_id` appartient à `auth.uid()`
3. Rate limiting : 10 générations/heure par `user_id`

**`/api/aides/sync`** (appelée uniquement par Vercel Cron) :
1. Vérification du header `Authorization: Bearer ${CRON_SECRET}`
2. Ne jamais exposer cette route publiquement

### Onboarding progressif — stratégie d'authentification

**Décision prise** : sessions anonymes Supabase (`signInAnonymously()`) — Option A.

- `user_id` toujours non-null → RLS inchangé, schéma simplifié
- Conversion vers compte complet à l'étape 2 (sauvegarde monument / accès S2)
- L'étape 1 (saisie monument + résultats) est accessible sans compte via session anonyme

### Données des aides
La base initiale de 30-50 aides pilotes est saisie directement via Supabase Studio (Table Editor). Pas d'interface admin dédiée pour le MVP. Extension via Aides-territoires sync + saisie manuelle Supabase Studio.

### Templates de dossiers
Les templates sont stockés en **TypeScript statique** dans le code source (`/lib/templates/`). Chaque organisme (DRAC, conseil régional, Fondation du Patrimoine…) a son propre fichier `Template`. Le champ `prompt_version` dans la table `dossiers` permet de tracer quelle version du template a été utilisée pour chaque génération.

### Index de performance
À créer dans les migrations initiales :
```sql
create index on monuments(user_id);
create index on monuments(region, departement);
create index on eligibility_results(monument_id);
create index on eligibility_results(aide_id);
create index on dossiers(user_id);
create index on alerts(user_id, statut);
create index on aides(categorie, is_active);
create index on aides(region_eligible, departement_eligible);
```

---

## RGPD

### Transfert de données vers Claude API
Les données S2 transitent par l'API Anthropic (hébergée aux États-Unis). Ce transfert vers un pays tiers nécessite :
- La signature d'un **Data Processing Agreement (DPA) avec Anthropic** avant toute mise en production
- La minimisation des données personnelles directement identifiantes dans les prompts (ne pas inclure nom/prénom complet, adresse précise si non nécessaire)

### Politique de rétention
À définir et implémenter avant la mise en production :
- Durée de conservation des dossiers après fin d'abonnement
- Mécanisme de suppression à la demande (droit à l'effacement RGPD)
- Cascade DELETE : `auth.users` → `profiles` → `monuments` → `dossiers` → `documents` → fichiers Supabase Storage

### Supabase Storage — politique de bucket
- Types MIME acceptés : `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/jpeg`, `image/png`
- Taille maximale par fichier : 10 Mo
- Accès : privé (pas d'URL publique), accès via signed URLs uniquement

---

## Chemin de migration V2

Si la souveraineté française devient un critère commercial (collectivités publiques, appels d'offres) :

| Composant MVP | Composant V2 | Effort |
|---------------|--------------|--------|
| Vercel (Frankfurt) | Scaleway App Engine (Paris) | Moyen — même code Next.js |
| Supabase Cloud (Frankfurt) | Supabase self-hosted sur Scaleway (Paris) | Moyen — même schéma SQL |
| Supabase Storage | Scaleway Object Storage (S3-compatible) | Faible — même SDK S3 |

Aucune réécriture applicative nécessaire. La migration est une opération infra.

> **Note Claude API** : en V2 souveraine, l'usage de Claude API (US) pour S2 est incompatible avec une clause de souveraineté stricte. Il faudra évaluer un modèle alternatif hébergé en France/UE ou négocier un accord spécifique.

---

## Variables d'environnement requises

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # ⚠️ CRITIQUE — bypasse le RLS, ne jamais exposer côté client ni logger

# Claude API
ANTHROPIC_API_KEY=

# Aides-territoires
AIDES_TERRITOIRES_API_KEY=

# Brevo
BREVO_API_KEY=

# Sécurité Cron
CRON_SECRET=                 # Vérifié dans /api/aides/sync pour bloquer les appels non autorisés
```

> **Hiérarchie de sensibilité** :
> - `SUPABASE_SERVICE_ROLE_KEY` : accès total à toutes les données de tous les utilisateurs (bypass RLS). Ne jamais utiliser côté client, ne jamais logger, ne jamais committer.
> - `ANTHROPIC_API_KEY` : génère des coûts réels à chaque appel. Protéger avec rate limiting.
> - `CRON_SECRET` : protège les routes de synchronisation contre les appels externes.
