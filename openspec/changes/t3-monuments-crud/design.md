## Context

La page `/monuments` est un placeholder vide. Les Server Actions `createMonument` / `deleteMonument` existent dans `actions/monuments.ts` mais sans validation Zod ni UI. Le proxy Mérimée (`/api/merimee/search`) est fonctionnel avec cache 24h. La table `public.monuments` et ses politiques RLS sont en place depuis T1.

## Goals / Non-Goals

**Goals:**
- Afficher la liste des monuments de l'utilisateur connecté (Server Component, SSR)
- Permettre la création d'un monument via formulaire avec autocomplétion Mérimée (Client Component)
- Permettre la suppression d'un monument
- Ajouter une navigation entre les sections de l'app (`/monuments`, `/aides`, `/dossiers`)
- Ajouter la validation Zod dans `createMonument`

**Non-Goals:**
- Édition d'un monument existant
- Moteur de matching S1
- Export ou impression
- Pagination (MVP : < 20 monuments par utilisateur attendus)

## Decisions

### D1 — Server Component pour la liste, Client Component pour le formulaire

**Décision** : `MonumentsPage` (RSC) lit les monuments via Supabase server. `MonumentForm` est un Client Component (`useActionState` + appel fetch Mérimée).

**Pourquoi** : La liste est statique — pas besoin d'interactivité côté client, SSR suffit. Le formulaire nécessite un debounce + état de recherche Mérimée : incompatible avec RSC.

**Alternative écartée** : Route Handler GET pour la liste — inutile, les RSC ont accès direct au client Supabase server.

---

### D2 — Autocomplétion Mérimée : fetch client vers `/api/merimee/search`

**Décision** : Le composant `MerimeeSearch` fait des appels `fetch` client (debounce 300 ms, ≥ 2 caractères) vers le proxy Next.js existant. La sélection d'un résultat pré-remplit les champs cachés du formulaire.

**Pourquoi** : Le proxy gère déjà le cache 24h et le fallback. Appel direct depuis le client évite un double aller-retour server.

**Alternative écartée** : Server Action pour la recherche Mérimée — les Server Actions ne sont pas conçues pour les appels de type "typeahead" (latence et architecture inadaptées).

---

### D3 — Saisie manuelle = mode secondaire, pas un formulaire séparé

**Décision** : Un toggle "Je ne trouve pas mon monument" bascule le formulaire en mode manuel (tous les champs libres, sans autocomplétion). Le même `createMonument` Server Action gère les deux cas (`ref_merimee` = null si manuel).

**Pourquoi** : Un seul flux de soumission, une seule Server Action, moins de surface d'erreur.

---

### D4 — Validation Zod ajoutée dans `createMonument`

**Décision** : Schéma Zod défini dans `lib/validations/monuments.ts`, importé dans la Server Action.

**Pourquoi** : Le TODO dans `actions/monuments.ts` l'indique explicitement. Sans validation, un champ `nom` vide passe en base.

---

### D5 — Navigation dans `app/(app)/layout.tsx`

**Décision** : Liens nav (`/monuments`, `/aides`, `/dossiers`) ajoutés dans le `<header>` existant du layout app.

**Pourquoi** : Le layout est déjà partagé par toutes les pages app. Pas besoin d'un composant `Sidebar` à ce stade (MVP).

## Risks / Trade-offs

- **API Mérimée instable** → déjà géré : le proxy retourne `{ results: [], fallback: true }` et le composant bascule en mode manuel. Risque résiduel faible.
- **Suppression sans confirmation** → risque UX : un clic accidentel supprime. Mitigation : bouton de confirmation inline (double-clic ou modale légère).
- **Pas de pagination** → acceptable pour le MVP (quelques dizaines de monuments max par utilisateur).
