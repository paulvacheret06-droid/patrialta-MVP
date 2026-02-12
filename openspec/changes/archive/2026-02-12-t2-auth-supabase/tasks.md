# Tasks : T2 — Authentification Supabase

## 1. Prérequis Supabase

- [x] 1.1 Appliquer la migration `supabase/migrations/001_initial_schema.sql` dans le projet Supabase (dashboard SQL Editor)
- [x] 1.2 Désactiver la confirmation email dans Supabase Auth Settings (Auth > Settings > "Confirm email" = off)
- [x] 1.3 Vérifier la présence des variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`

## 2. Validation des formulaires

- [x] 2.1 Créer `lib/validations/auth.ts` — schémas Zod pour `LoginSchema` (email + password ≥ 8 chars) et `SignupSchema` (email + password + statut_juridique + commune)

## 3. Server Actions

- [x] 3.1 Créer `actions/auth.ts` — implémenter `loginAction` (appel `supabase.auth.signInWithPassword`, retour d'erreur typé, redirection vers `?redirect` ou `/monuments`)
- [x] 3.2 Implémenter `signupAction` dans `actions/auth.ts` — appel `supabase.auth.signUp` puis insert `public.profiles`, gestion erreur profil indépendante de l'erreur auth
- [x] 3.3 Implémenter `logoutAction` dans `actions/auth.ts` — appel `supabase.auth.signOut` puis redirection vers `/login`

## 4. Layout et pages auth

- [x] 4.1 Créer `app/(auth)/layout.tsx` — vérifier session serveur, rediriger vers `/monuments` si utilisateur déjà connecté
- [x] 4.2 Implémenter `app/(auth)/login/page.tsx` — Client Component, formulaire email/password avec `useActionState`, affichage des erreurs retournées par `loginAction`
- [x] 4.3 Implémenter `app/(auth)/signup/page.tsx` — Client Component, formulaire en deux sections (identifiants + profil : statut juridique sélecteur + commune), `useActionState` sur `signupAction`

## 5. Layout applicatif

- [x] 5.1 Mettre à jour `app/(app)/layout.tsx` — récupérer l'utilisateur connecté (server), afficher son email et un bouton "Déconnexion" (form action vers `logoutAction`)
- [x] 5.2 Ajouter la détection de profil absent dans `app/(app)/layout.tsx` — si `profiles` vide pour l'utilisateur, afficher une bannière "Complétez votre profil"

## 6. Tests Playwright

- [x] 6.1 Créer `tests/e2e/auth.spec.ts` — test inscription (nouvel email), connexion (email/password valides), déconnexion
- [x] 6.2 Ajouter un test protection de routes : accès non authentifié à `/monuments` → redirection vers `/login?redirect=/monuments`
- [x] 6.3 Lancer les tests et vérifier 0 erreur
