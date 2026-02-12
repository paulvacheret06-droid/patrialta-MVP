## Why

Le scaffolding T1 a posé la structure Next.js 15, le middleware de session et les pages auth en placeholder. Sans couche d'authentification fonctionnelle, aucune fonctionnalité applicative (monuments, aides, dossiers) ne peut être testée ni construite : c'est le socle bloquant de toute la suite du MVP.

## What Changes

- Page **Connexion** (`/login`) : formulaire email/password fonctionnel avec Server Action Supabase Auth
- Page **Inscription** (`/signup`) : formulaire email/password + création du profil utilisateur initial
- **Déconnexion** : Server Action `logout` accessible depuis le layout app
- **Profil utilisateur** : étape de complétion post-inscription (statut juridique propriétaire : collectivité / privé / association + commune ou département)
- Middleware de protection de routes : vérification que les redirections `/login?redirect=…` fonctionnent correctement avec les sessions SSR

## Non-goals

- OAuth / connexion sociale (Google, France Connect)
- Magic links par email
- Réinitialisation de mot de passe
- Vérification email obligatoire (à activer en V2)
- Gestion des rôles et permissions (admin vs utilisateur)

## Capabilities

### New Capabilities

- `user-auth` : inscription email/password, connexion, déconnexion, gestion des sessions SSR via cookies Supabase (@supabase/ssr)
- `user-profile` : création et lecture du profil utilisateur (table `profiles`) — statut juridique propriétaire, commune/département, SIREN optionnel

### Modified Capabilities

_(aucune — pas de specs existantes)_

## Impact

**Fichiers modifiés / créés :**
- `app/(auth)/login/page.tsx` — formulaire connexion (remplace placeholder)
- `app/(auth)/signup/page.tsx` — formulaire inscription + profil initial
- `app/(auth)/layout.tsx` — layout pages auth (si absent)
- `actions/auth.ts` — Server Actions : `login`, `signup`, `logout`
- `app/(app)/layout.tsx` — ajout bouton déconnexion + affichage email utilisateur

**Fichiers inchangés :**
- `middleware.ts` — logique de protection déjà correcte, pas de modification
- `lib/supabase/` — clients déjà configurés (server, client, service)
- `supabase/migrations/001_initial_schema.sql` — table `profiles` déjà définie

**Dépendances :**
- `@supabase/ssr` (déjà installé)
- `@supabase/supabase-js` (déjà installé)

**Variables d'environnement requises :**
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
