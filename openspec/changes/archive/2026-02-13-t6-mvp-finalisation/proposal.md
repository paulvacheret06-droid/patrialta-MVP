## Why

T1–T5 ont construit toute l'infrastructure fonctionnelle du MVP (auth, monuments, S1 matching, S2 montage). Avant le lancement sur les régions pilotes, il reste trois lacunes critiques : le catalogue d'aides ne contient que 10 entrées de démo (le PRD exige 30–50 aides réelles), le parcours utilisateur manque d'un onboarding progressif qui concrétise la valeur dès la première interaction, et la conformité légale (CGU, mentions légales, RGPD) est absente alors qu'elle conditionne tout accès utilisateur. T6 finalise le MVP pour qu'il soit déployable en conditions réelles.

## What Changes

- **Catalogue aides enrichi** : passer de 10 aides de démo à 30–50 aides réelles et vérifiées couvrant l'État/DRAC, les régions AuRA + Grand Est, les départements pilotes (Rhône, Ain, Aube), la Fondation du Patrimoine, les fondations privées (VMF, Sauvegarde de l'Art Français, Fondation de France) et l'Europe (FEDER, LEADER)
- **Onboarding progressif** : parcours 4 étapes selon PRD §4 — landing page accueil, état vide premier monument, fil d'Ariane S1 → S2, bannière de valeur immédiate
- **Pages légales et RGPD** : CGU, mentions légales, politique de confidentialité, mentions de consentement dans les formulaires, politique de rétention des données

## Capabilities

### New Capabilities

- `aide-catalogue-enrichi` : script d'enrichissement du catalogue — 30–50 aides réelles structurées selon le schéma `Aide` existant, organisées par source (DRAC, régions, départements, fondations, Europe), vérifiées manuellement, upsertées via `service_role`
- `onboarding` : landing page `/` avec proposition de valeur, état vide pour le premier monument (call-to-action), fil de navigation S1 → S2 (de la liste des aides vers "Démarrer un dossier"), bannière de progression onboarding
- `legal-rgpd` : pages `/legal/cgu`, `/legal/mentions-legales`, `/legal/confidentialite`, liens dans le footer, case de consentement à l'inscription, politique de rétention documentée

### Modified Capabilities

- `aide-catalogue` : la seed data passe de 10 aides de démo à 30–50 aides réelles — mise à jour du Requirement "Seed data" pour refléter la couverture géographique et typologique complète

## Impact

- **Supabase** : remplacement/enrichissement du seed `002_seed_aides.sql` (upsert idempotent sur `slug`)
- **Nouvelles pages** : `/` (landing), `/legal/cgu`, `/legal/mentions-legales`, `/legal/confidentialite`
- **Nouveaux scripts** : `scripts/seed-aides-full.ts` (30–50 aides, upsert idempotent)
- **Fichiers de données** : `/lib/s1/seed/aides-enrichies.ts` — données structurées TypeScript des 30–50 aides
- **Layout** : footer global avec liens légaux, navbar avec lien d'accueil
- **Dépendances** : aucune nouvelle — tout est dans la stack existante
- **Non-goals** : interface admin pour gérer le catalogue (V2), internationalisation, mode multi-langues, analytics, chatbot
