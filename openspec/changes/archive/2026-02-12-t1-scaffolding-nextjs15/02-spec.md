# Spec : T1 — Scaffolding Next.js 15 PatriAlta

## Structure app/

```
app/
  layout.tsx                  — layout racine (Tailwind globals)
  page.tsx                    — landing placeholder
  globals.css
  (auth)/
    login/page.tsx
    signup/page.tsx
  (app)/
    layout.tsx
    aides/page.tsx
    monuments/page.tsx
    dossiers/page.tsx
  api/
    merimee/search/route.ts   — proxy Mérimée, cache 24h
    aides/sync/route.ts       — cron Aides-territoires (CRON_SECRET)
    dossiers/generate/route.ts — Claude streaming SSE
```

## Interfaces TypeScript (lib/s1/types.ts)

- `Monument` — données monument (référence Mérimée, commune, département, région, statut protection, type propriétaire)
- `Critere` — critère d'éligibilité (id, type, valeur attendue)
- `ResultatCritere` — résultat par critère (`rempli` | `non_rempli` | `a_verifier`)
- `Aide` — aide financière (id, nom, organisme, critères, règles de cumul)
- `ResultatEligibilite` — résultat matching monument × aide

## Interfaces TypeScript (lib/s2/types.ts)

- `ContenuDossier` — contenu généré par Claude (sections JSONB)
- `Template` — template par organisme (sections, variables, instructions système)
- `OptionsGeneration` — options de génération (modèle Claude, streaming)

## Moteur S1 (lib/s1/engine.ts)

Fonction pure `calculerEligibilite(monument: Monument, aides: Aide[]): ResultatEligibilite[]`
- Zéro LLM, zéro effet de bord
- Évalue chaque critère de chaque aide contre les données du monument
- Retourne ✓ / ✗ / ? par critère

## Clients Supabase (lib/supabase/)

- `client.ts` — `createBrowserClient()` pour composants client
- `server.ts` — `createServerClient()` avec cookies Next.js pour Server Components / Server Actions
- `service.ts` — `createServiceRoleClient()` pour cron et opérations admin (jamais exposé côté client)

## Middleware (middleware.ts)

- Refresh session Supabase sur chaque requête
- Protection routes `/(app)/*` → redirect `/login` si non authentifié
- Routes publiques : `/`, `/login`, `/signup`, `/api/merimee/search`

## Schéma base de données (supabase/migrations/001_initial_schema.sql)

7 tables : `profiles`, `monuments`, `aides`, `eligibility_results`, `dossiers`, `documents`, `alerts`

RLS activé sur toutes les tables utilisateur. `aides` : lecture publique, écriture service_role uniquement.

Index sur : `monuments(user_id)`, `eligibility_results(monument_id, aide_id)`, `dossiers(monument_id)`, `alerts(user_id, sent_at)`.

## Route Handler `/api/dossiers/generate`

- Auth JWT obligatoire + vérification ownership du dossier
- Rate limit : 10 générations/heure par `user_id`
- Streaming SSE via Claude API (`claude-sonnet-4-5-20250929`)
- `export const runtime = 'nodejs'` (incompatibilité Edge avec `@react-pdf/renderer`)

## Config Vercel (vercel.json)

2 cron jobs Pro :
- `sync-aides` — 3h00 UTC — sync Aides-territoires
- `send-alerts` — 8h00 UTC — envoi alertes email Brevo

## Tables Supabase impactées

Toutes les tables créées ex-nihilo dans `001_initial_schema.sql`. Aucune migration RLS additionnelle requise pour T1.
