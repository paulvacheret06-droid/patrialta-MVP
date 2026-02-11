# PatriAlta — Contexte Projet

## Vision

PatriAlta est une plateforme SaaS B2B de gestion du patrimoine historique. Elle aide les collectivités locales et propriétaires privés de monuments historiques à :
1. Identifier les aides financières auxquelles ils sont éligibles (Service 1 — Mouline)
2. Monter leurs dossiers de subvention (Service 2 — Montage)

**Proposition de valeur** : passer de "j'ai un monument" à "j'ai un dossier de subvention prêt" sans consultant.

---

## Cibles utilisateurs

| Segment | Utilisateur-type | Expertise |
|---|---|---|
| Grosses communes (15k–50k hab) | Adjoint culture / responsable patrimoine | Moyen |
| Moyennes communes (5k–15k hab) | Adjoint culture / secrétaire de mairie | Faible à moyen |
| Petites communes (< 2k hab) | Maire / secrétaire de mairie | Faible |
| Propriétaires privés | Le propriétaire lui-même | Faible |

**Régions pilotes MVP** : Auvergne-Rhône-Alpes + Aube (Champagne)

**Statut juridique du propriétaire** : critère de filtrage clé (collectivité / privé / association) car certaines aides sont réservées à un type de propriétaire.

---

## Architecture des services

### S1 — Mouline (moteur d'identification des aides)
- Logique **100% déterministe, TypeScript pur** — aucun LLM
- Autocomplétion monument via **API Mérimée** (proxy Next.js, cache 24h)
- Saisie manuelle pour monuments hors Mérimée (SPR, labels, non protégé)
- Filtrage géographique automatique (national + région + département)
- Affichage factuel : ✓ critère rempli / ✗ non rempli / ? à vérifier
- Pas de score de confiance — factuel uniquement
- Modes : généraliste (par défaut) + projet (travaux précisés)
- Simulateur de financement (Server Action, pas client-side)
- Veille push : alertes email nouvelles aides + deadlines via Vercel Cron
- Export PDF des aides éligibles
- **30–50 aides au lancement** (État/DRAC, régions AuRA + Grand Est, départements, fondations privées, Europe)

### S2 — Montage de dossiers
- Génération via **Claude API** (streaming SSE)
- Modèles : `claude-sonnet-4-5-20250929` (standard) / `claude-opus-4-6` (complexes)
- Templates par organisme stockés en TypeScript statique (`/lib/templates/`)
- Pré-remplissage depuis S1 (continuité de données)
- Dashboard upload pièces justificatives (Supabase Storage)
- Checklist dynamique des pièces par organisme
- Output : PDF (`@react-pdf/renderer`) ou Word (`docx` npm)
- Validation humaine obligatoire avant export — jamais d'envoi automatique

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript strict |
| Base de données | Supabase PostgreSQL (Frankfurt EU) |
| Auth | Supabase Auth (JWT + sessions anonymes pour onboarding) |
| Storage | Supabase Storage (privé, signed URLs) |
| ORM | Supabase TypeScript SDK (types auto-générés) |
| Hébergement | Vercel Pro (Frankfurt EU) |
| Email | Brevo API v3 |
| PDF | @react-pdf/renderer (runtime nodejs — incompatible Edge) |
| Word | docx (npm) |
| IA | Claude API (S2 uniquement) |
| Cron | Vercel Cron Pro (2 jobs : sync-aides 3h + send-alerts 8h) |
| Styling | Tailwind CSS + shadcn/ui |
| Monitoring | Sentry |
| Validation | Zod (données API Aides-territoires) |

---

## Sources de données

| Source | Usage | Auth |
|---|---|---|
| **Base Mérimée** (api.pop.culture.gouv.fr/maison/merimee) | Autocomplétion monuments historiques | Publique |
| **Aides-territoires** (aides-territoires.beta.gouv.fr/api/) | Sync quotidienne aides publiques | Clé API |
| **Base interne PatriAlta** | Fondations privées + aides locales hors Aides-territoires | — |

---

## Modèle de données (tables principales)

- `profiles` — statut juridique, commune, SIREN (référence `auth.users`)
- `monuments` — données officielle Mérimée ou saisie manuelle, multi-monuments par user
- `aides` — critères d'éligibilité structurés, règles de cumul JSONB, accès public en lecture
- `eligibility_results` — résultats matching monument × aide (criteres_remplis / manquants / a_verifier)
- `dossiers` — contenu généré par Claude (JSONB `ContenuDossier`), version + prompt_version
- `documents` — pièces justificatives (Supabase Storage)
- `alerts` — veille push (nouvelle_aide / deadline_approche)

**RLS natif Supabase** : chaque utilisateur n'accède qu'à ses données. `aides` = lecture publique, écriture service_role uniquement.

---

## Conventions de développement

- **Matching S1 : zéro LLM** — logique déterministe pure, testable unitairement
- **Interfaces TypeScript** définies avant tout code applicatif (`Critere`, `ResultatEligibilite`, `ContenuDossier`, `Template`, `ReglesCumul`)
- **Server Actions** pour CRUD monuments, profils, alertes, simulateur de financement
- **Route Handlers** pour : `/api/merimee/search` (cache 24h), `/api/aides/sync` (cron protégé CRON_SECRET), `/api/dossiers/generate` (Claude streaming, JWT + ownership + rate limit 10 gen/h)
- **Épingler toutes les dépendances** dans `package.json` avant le premier commit
- **Commits conventionnels** (feat, fix, chore, etc.)
- Les routes générant des PDFs déclarent `export const runtime = 'nodejs'`

---

## Variables d'environnement requises

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     ⚠️ bypass RLS — jamais côté client
ANTHROPIC_API_KEY
AIDES_TERRITOIRES_API_KEY
BREVO_API_KEY
CRON_SECRET
```

---

## Hors scope MVP (V2+)

- Réseau de professionnels (ABF, DRAC, consultants)
- Suivi post-dépôt (instruction → accordé/refusé)
- Mode collaboratif multi-contributeurs
- Envoi dématérialisé des dossiers
- Historique des aides déjà obtenues
- Chatbot / assistant conversationnel
- Analytics poussés
