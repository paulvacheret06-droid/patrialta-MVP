## Context

Le scaffolding T1 a produit `middleware.ts` (session refresh + protection de routes), `lib/supabase/` (clients server/browser/service), et les pages auth en placeholder. La migration SQL définit la table `profiles` avec RLS. Il s'agit maintenant de rendre tout cela fonctionnel.

Contrainte centrale : Next.js 15 App Router avec Server Actions. Pas de pages API dédiées pour l'auth, pas de client-side JS sauf pour les retours d'erreur de formulaire.

## Goals / Non-Goals

**Goals:**
- Formulaires login/signup fonctionnels via Server Actions (zero-JS fallback)
- Sessions SSR correctement rafraîchies via `@supabase/ssr` (déjà en place dans middleware)
- Profil utilisateur créé à l'inscription (statut juridique + commune)
- Déconnexion depuis le layout app
- Redirection post-login vers la destination d'origine (`?redirect=`)

**Non-Goals:**
- OAuth, magic links, réinitialisation de mot de passe
- Vérification email obligatoire (désactivée côté Supabase pour le MVP)
- Sessions anonymes (non nécessaires au stade actuel)

## Decisions

### 1. Server Actions pour l'authentification (pas de Route Handlers)

**Choix :** `actions/auth.ts` avec `loginAction`, `signupAction`, `logoutAction` en Server Actions Next.js.

**Rationale :** Cohérent avec les conventions du projet (CRUD monuments aussi en Server Actions). Les Server Actions sont appelables directement depuis `<form action={...}>`, sans JavaScript côté client pour le chemin nominal. Simplifie la gestion des cookies SSR car les Server Actions s'exécutent dans le même contexte serveur que les Server Components.

**Alternative écartée :** Route Handlers (`/api/auth/*`) — surcoût inutile, introduit un aller-retour HTTP supplémentaire, nécessite une gestion CSRF manuelle.

---

### 2. Retour d'erreur via `useActionState` (React 19)

**Choix :** Les pages login/signup sont des Client Components (`'use client'`) uniquement pour utiliser `useActionState` et afficher les erreurs sans rechargement complet.

**Rationale :** Next.js 15 est sur React 19 — `useActionState` est le pattern officiel pour les formulaires avec Server Actions. Le formulaire reste progressivement amélioré (fonctionne sans JS grâce à `action={serverAction}`).

**Alternative écartée :** `useFormStatus` seul ne permet pas de lire le retour de l'action. Passer les erreurs via `searchParams` URL est fragile (risque de fuite d'infos dans les logs).

---

### 3. Création du profil dans `signupAction` (pas de trigger Supabase)

**Choix :** `signupAction` crée l'utilisateur via `supabase.auth.signUp()`, puis insère dans `public.profiles` dans la même Server Action.

**Rationale :** La logique reste dans le code TypeScript, testable unitairement, sans dépendance sur des triggers DB. Les champs profil (statut_juridique, commune) sont saisis directement sur la page d'inscription — un seul round-trip.

**Risque géré :** Si l'insert `profiles` échoue après la création `auth.users`, l'utilisateur existe sans profil. Mitigation : afficher un message d'erreur et permettre la complétion du profil depuis les paramètres (V2). Pour le MVP, l'insert sera retentable via une page `/onboarding` si le profil est absent.

---

### 4. Profil collecté à l'inscription (pas de page `/onboarding` séparée)

**Choix :** La page `/signup` comporte deux sections : (1) email/password, (2) statut juridique + commune. Un seul submit.

**Rationale :** Réduit le nombre de redirections et de pages à maintenir pour le MVP. Le statut juridique est un critère de filtrage des aides dès la première utilisation de S1 — le collecter d'emblée est préférable.

**Alternative écartée :** Page `/onboarding` post-inscription avec redirection forcée. Complexité supplémentaire (détection profil absent dans le middleware) non justifiée pour le MVP.

---

### 5. Layout auth avec redirection si déjà connecté

**Choix :** `app/(auth)/layout.tsx` vérifie la session serveur et redirige vers `/monuments` si l'utilisateur est déjà authentifié.

**Rationale :** Évite qu'un utilisateur connecté arrive sur `/login` et soit perdu.

## Risks / Trade-offs

- **Désynchronisation auth.users / profiles** → Si l'insert `profiles` échoue, l'utilisateur peut se connecter mais le profil est absent. Mitigation MVP : détecter l'absence de profil dans le layout app et afficher une bannière de complétion.

- **Validation Supabase email** → Par défaut, Supabase envoie un email de confirmation. Pour le MVP, cette vérification doit être désactivée dans le dashboard Supabase (Auth > Settings > "Confirm email" = off). À documenter dans le README.

- **`useActionState` et hydratation** → Les pages login/signup sont Client Components légers. Risque de flash d'hydratation si l'état initial diffère. Mitigation : état initial `null` (pas d'erreur par défaut).

## Migration Plan

1. Appliquer la migration SQL `001_initial_schema.sql` dans le projet Supabase (dashboard ou CLI)
2. Désactiver la confirmation email dans Supabase Auth Settings (MVP uniquement)
3. Vérifier les variables d'environnement dans `.env.local`
4. Déployer — pas de rollback complexe (tables vides au départ)

## Open Questions

- _(aucune — scope clair pour le MVP)_
