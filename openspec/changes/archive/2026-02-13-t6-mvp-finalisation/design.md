## Context

T5 a livré un MVP techniquement complet mais non encore déployable en conditions réelles : le catalogue contient 10 aides de démo insuffisantes pour démontrer la valeur sur les régions pilotes, l'interface ne guide pas un nouvel utilisateur vers la valeur (pas de landing, pas d'état vide), et l'absence de mentions légales bloque toute ouverture publique (obligations RGPD).

**État actuel :**
- `/lib/s1/seed/aides.ts` : 10 aides mock, structure TypeScript correcte, upsert idempotent via `slug`
- Script `scripts/seed-aides.ts` : existe, fonctionnel, prêt à être enrichi
- Pages légales : inexistantes
- Landing `/` : redirige directement vers `/monuments` (pas d'accueil)
- Footer : absent ou minimal, pas de liens légaux

## Goals / Non-Goals

**Goals:**
- Porter le catalogue à 30–50 aides réelles, vérifiées, couvrant DRAC, AuRA, Grand Est, Rhône, Ain, Aube, Fondation du Patrimoine, VMF, Sauvegarde de l'Art Français, Fondation de France, FEDER/LEADER
- Créer une landing page `/` qui crée la valeur perçue avant même l'inscription
- Créer le parcours d'onboarding progressif (état vide → premier monument → aides → dossier)
- Mettre en place les pages légales obligatoires avec footer global

**Non-Goals:**
- Interface admin pour gérer le catalogue en base (V2 — dashboard CMS)
- Internationalisation / multilangue
- Analytics et tracking comportemental
- Chatbot d'assistance
- Envoi de newsletter ou de communications marketing automatiques

## Decisions

### D1 — Données aides en TypeScript statique, pas en migration SQL dynamique

Les 30–50 aides sont codées en TypeScript dans `/lib/s1/seed/aides-enrichies.ts` et insérées via `scripts/seed-aides-full.ts` (upsert sur `slug`). Le schéma `Aide` existant est conservé sans modification.

**Alternatives considérées :**
- CSV/JSON : moins typé, plus fragile à maintenir, pas de validation Zod native
- Migration SQL directe : difficile à maintenir et à valider sans accès SQL direct (contrainte projet)
- API Aides-territoires seule : ne couvre pas les fondations privées ni les aides locales hors scope API

**Choix retenu :** TypeScript pur — lisible, validé par Zod au runtime, cohérent avec la convention existante, et maintenable sans outillage supplémentaire.

### D2 — Landing page statique Server Component, pas de marketing dynamique

`/app/page.tsx` devient une landing page Next.js 15 Server Component avec hero, proposition de valeur en 4 points, CTA "Commencer" → `/monuments`. Pas de CMS, pas de contenu dynamique.

**Choix retenu :** Simplicité — le MVP n'a pas besoin d'A/B testing ni de gestion de contenu. Une page statique bien construite suffit pour le test utilisateur.

### D3 — Pages légales en Markdown compilé (MDX ou composant JSX statique)

Les pages `/legal/*` sont des Server Components statiques avec contenu intégré directement en JSX (pas de MDX pour éviter une dépendance supplémentaire). Mises en cache indéfiniment par Next.js.

**Choix retenu :** Pas de CMS, pas de MDX — le contenu légal change rarement, JSX statique est suffisant et évite une dépendance.

### D4 — Footer global dans le layout racine

Un composant `Footer` est ajouté dans `/app/layout.tsx` avec liens vers les pages légales. Présent sur toutes les pages sauf les pages d'export PDF (routes `/api/*`).

### D5 — Consentement RGPD : case à cocher à l'inscription

Le formulaire d'inscription existant est enrichi d'une case à cocher obligatoire "J'accepte les CGU et la politique de confidentialité". Le profil `profiles` reçoit un champ `rgpd_consent_at timestamptz NULL` (migration additive).

## Risks / Trade-offs

- **[Qualité des données aides]** : Les données des fondations privées sont moins standardisées que les aides publiques → Mitigation : chaque aide inclut `source_url` vers la page officielle, l'utilisateur peut vérifier directement. Les critères sont marqués `a_verifier` si la règle n'est pas certaine.
- **[Couverture géographique incomplète]** : Tous les départements des régions pilotes ne sont pas forcément couverts → Mitigation : priorité aux organismes avec le plus d'impact (DRAC, région, fondations nationales). Les aides départementales peuvent rester à 1-2 par département.
- **[Pages légales non validées par juriste]** : Le contenu CGU/RGPD est un template standard adapté → Mitigation : disclaimer explicite sur les pages légales que l'utilisateur doit consulter un juriste pour toute question spécifique. Version MVP suffisante pour le test pilote.

## Migration Plan

1. Exécuter `scripts/seed-aides-full.ts` (upsert idempotent — ne casse pas les données existantes)
2. Appliquer la migration Supabase `004_add_rgpd_consent.sql` via le Dashboard SQL Editor
3. Déployer sur Vercel (layout + landing + pages légales = changement UI pur, pas de breaking change)
4. Rollback : le seed est idempotent, les pages légales sont additives, aucune migration destructive

## Open Questions

- Faut-il ajouter un cookie banner / bandeau RGPD pour les cookies analytiques ? (Pas de cookies analytics dans le MVP → réponse : non)
- Le champ `rgpd_consent_at` doit-il être obligatoire pour les utilisateurs existants avant T6 ? (Réponse : non — on n'impose pas la rétro-compatibilité sur les comptes de test)
