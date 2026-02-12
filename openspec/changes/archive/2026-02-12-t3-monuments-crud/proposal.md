## Why

Après T2 (authentification), l'utilisateur peut se connecter mais n'a aucune donnée à gérer. T3 pose la fondation du service S1 Mouline : sans monument saisi, aucun matching d'éligibilité n'est possible. La page `/monuments` est actuellement un placeholder vide.

## What Changes

- La page `/monuments` affiche la liste des monuments de l'utilisateur connecté
- Formulaire de création avec autocomplétion Mérimée (proxy `/api/merimee/search` déjà scaffoldé) et saisie manuelle en fallback
- Suppression d'un monument (ownership vérifié par RLS existante)
- Ajout d'une navigation dans le layout app (`/monuments`, `/aides`, `/dossiers`)
- Validation Zod côté Server Action pour les entrées du formulaire (TODO supprimé)

## Capabilities

### New Capabilities

- `monument-crud` : liste, création et suppression de monuments protégés par RLS Supabase ; données stockées dans `public.monuments` (schéma existant)
- `merimee-autocomplete` : recherche de monuments via API Mérimée avec debounce (≥2 caractères), cache 24h côté Next.js, fallback gracieux vers saisie manuelle si l'API est indisponible

### Modified Capabilities

_(Aucun changement de requirements sur les specs existantes — `user-auth` et `user-profile` ne sont pas affectées.)_

## Non-goals

- Moteur de matching S1 (réservé à T4 — Mouline)
- Édition d'un monument existant (V2)
- Export PDF de la liste
- Intégration S2 Montage (aucun LLM dans ce change)

## Impact

- **Fichiers modifiés** : `app/(app)/monuments/page.tsx`, `app/(app)/layout.tsx`, `actions/monuments.ts`
- **Nouveaux fichiers** : composants `MonumentList`, `MonumentForm`, `MerimeeSearch`
- **Route Handler existante** : `app/api/merimee/search/route.ts` utilisée en lecture seule (pas de modification)
- **S1** : aucun impact — le matching déterministe n'est pas touché
- **S2** : aucun impact — pas de Claude API dans ce change
- **RLS** : politique existante sur `public.monuments` suffisante
