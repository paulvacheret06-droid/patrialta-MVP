## Why

T4 a livré le cœur du moteur Mouline S1 (matching déterministe, affichage des aides éligibles), mais plusieurs fonctionnalités S1 critiques ont été explicitement reportées (simulateur de financement, export PDF, mode projet, sync Aides-territoires, veille push), et le Service 2 — Montage de dossiers — reste entièrement à construire. T5 complète le MVP en livrant les deux : la complétion S1 qui rend l'outil autonome, et le S2 qui concrétise la proposition de valeur différenciante ("de monument à dossier prêt").

## What Changes

**S1 — Complétion :**
- Simulateur de plan de financement : coût travaux estimé → combinaisons d'aides possibles avec montants, taux et règles de cumul (Server Action, pas client-side)
- Mode projet : champs optionnels sur le monument (`description_projet`, `type_travaux`, `budget_estime`) → matching affiné par type de travaux
- Sync Aides-territoires : Route Handler `/api/aides/sync` protégée `CRON_SECRET`, Vercel Cron 1x/jour à 3h, validation Zod de chaque objet reçu, diff (seules les aides modifiées sont mises à jour)
- Veille push : Vercel Cron 1x/jour à 8h, compare nouvelles aides + deadlines approchantes vs profils monuments sauvegardés, envoie alertes email Brevo
- Export PDF synthèse des aides éligibles (`@react-pdf/renderer`, `runtime = 'nodejs'`)

**S2 — Montage de dossiers :**
- Tables Supabase `dossiers` + `documents` (migrations SQL + RLS)
- Templates par organisme en TypeScript statique (`/lib/templates/`) : DRAC, conseil régional AuRA, Fondation du Patrimoine
- Route Handler `/api/dossiers/generate` : Claude API streaming SSE (`claude-sonnet-4-5-20250929`), vérification JWT + ownership + rate limit 10 générations/heure
- Pré-remplissage automatique depuis les données monument et `eligibility_results` (continuité S1 → S2)
- Dashboard dossier : affichage sections générées, édition libre par l'utilisateur, indicateur de progression
- Upload pièces justificatives : Supabase Storage (bucket privé, signed URLs, types MIME restreints, max 10 Mo)
- Checklist dynamique des pièces requises par organisme avec statut (manquant / uploadé / validé)
- Export dossier finalisé : PDF (`@react-pdf/renderer`) et/ou DOCX (`docx` npm)
- Incitation forte à la relecture humaine dans le design (disclaimer, pas d'envoi automatique)

## Capabilities

### New Capabilities

- `financement-simulator` : simulateur coût travaux → combinaisons d'aides éligibles avec montants, taux, plafonds de cumul
- `mode-projet` : champs projet sur le monument (travaux, budget) + filtrage des aides par type_travaux
- `aides-sync` : sync quotidienne Aides-territoires via Vercel Cron, validation Zod, diff, alerte admin si échec
- `veille-push` : alertes email Brevo (nouvelle_aide + deadline_approche), table `alerts`, Vercel Cron quotidien
- `eligibility-export-pdf` : export PDF synthèse des aides éligibles pour un monument (@react-pdf/renderer)
- `dossier-generation` : Route Handler `/api/dossiers/generate` — Claude API streaming SSE, templates par organisme, pré-remplissage S1, retry 3× backoff exponentiel
- `dossier-dashboard` : page dossier — sections générées, édition, progression, disclaimer relecture
- `dossier-documents` : upload pièces justificatives (Supabase Storage), checklist dynamique par organisme
- `dossier-export` : export dossier finalisé PDF + DOCX

### Modified Capabilities

- `eligibility-display` : ajout simulateur de financement intégré + bouton "Exporter PDF" + CTA "Démarrer un dossier" (lien vers S2)
- `monument-crud` : ajout des champs mode projet (`description_projet`, `type_travaux[]`, `budget_estime`) dans le formulaire monument

## Impact

- **Supabase** : 2 nouvelles tables (`dossiers`, `documents`) + Supabase Storage (bucket `dossiers-pieces`) + table `alerts` (déjà définie en architecture, à migrer)
- **Vercel Cron** : 2 nouveaux cron jobs (`sync-aides` 3h, `send-alerts` 8h) — plan Pro obligatoire
- **Nouvelles routes** : `/api/dossiers/generate` (nodejs runtime), `/api/aides/sync` (cron + CRON_SECRET)
- **Nouveaux libs** : `/lib/templates/` (3 templates initiaux), `/lib/s1/simulator.ts`, `/lib/actions/dossiers.ts`
- **Dépendances** : `@react-pdf/renderer` (déjà prévu), `docx` (déjà prévu), Brevo SDK (déjà prévu)
- **Variables env** : `ANTHROPIC_API_KEY`, `AIDES_TERRITOIRES_API_KEY`, `BREVO_API_KEY`, `CRON_SECRET` (déjà listées dans ARCHITECTURE.md)
- **Non-goals** : suivi post-dépôt, envoi dématérialisé, mode collaboratif, chatbot, interface admin aides
