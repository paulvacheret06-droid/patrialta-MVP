## Why

T1–T3 ont posé les fondations (scaffold, auth, gestion des monuments). T4 délivre la proposition de valeur centrale de PatriAlta : étant donné un monument, **quelles aides financières sont éligibles ?** C'est le cœur du Service 1 (Mouline) — sans lui, la plateforme n'a pas de valeur métier.

## What Changes

- Nouvelle table Supabase `aides` (critères d'éligibilité en JSONB, lecture publique, écriture service_role uniquement)
- Nouvelle table Supabase `eligibility_results` (résultats matching monument × aide, RLS par user)
- Interfaces TypeScript `Aide`, `Critere`, `ResultatEligibilite`, `ReglesCumul` définies dans `/lib/types/s1.ts`
- Moteur de matching déterministe `/lib/s1/matching.ts` — zéro LLM, testable unitairement
- Server Action `runMatching(monumentId)` qui calcule et persiste les résultats
- Page `/monuments/[id]/aides` affichant les résultats avec affichage factuel (✓ / ✗ / ?)
- Seed data : 10 aides représentatives (3 DRAC, 2 région AuRA, 2 Fondation du Patrimoine, 2 fondations privées, 1 Europe)

## Capabilities

### New Capabilities

- `aide-catalogue` : table `aides` + interfaces TypeScript + seed data initiale (10 aides). Critères d'éligibilité structurés en JSONB (type de protection, statut juridique propriétaire, géographie, catégorie de travaux).
- `eligibility-engine` : moteur de matching déterministe — croise les champs d'un monument avec les critères d'une aide et retourne `ResultatEligibilite` (criteres_remplis / manquants / a_verifier). Server Action `runMatching`.
- `eligibility-display` : page `/monuments/[id]/aides` affichant la liste des aides avec statut d'éligibilité factuel, filtres par catégorie, et lien vers source officielle.

### Modified Capabilities

- `monument-crud` : ajout d'un bouton "Voir les aides éligibles" sur la liste `/monuments` pointant vers `/monuments/[id]/aides`.

## Impact

- **Supabase** : 2 nouvelles tables (`aides`, `eligibility_results`) + migration SQL + RLS
- **Nouvelles routes** : `/monuments/[id]/aides` (page Server Component)
- **Nouveau lib** : `/lib/types/s1.ts`, `/lib/s1/matching.ts`
- **Pas d'impact** sur S2 (montage) — les données `eligibility_results` seront réutilisées en T5+ pour le pré-remplissage des dossiers
- **Non-goals** : simulateur de financement, export PDF, veille push, mode projet, sync Aides-territoires — reportés aux T5+
