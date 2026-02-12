# Proposal : T1 — Scaffolding Next.js 15 PatriAlta

## Objectif

Mettre en place la structure de base du projet PatriAlta : Next.js 15 App Router, TypeScript strict, intégrations Supabase, fondations S1 (moteur d'éligibilité) et S2 (génération de dossiers), schéma base de données complet avec RLS.

## Non-goals

- Aucune UI fonctionnelle (pages = placeholders)
- Aucune logique métier complète (aides non renseignées)
- Pas d'intégration réelle avec les APIs externes (Mérimée, Aides-territoires)
- Pas de tests E2E fonctionnels (placeholder uniquement)

## Options considérées

### Option A — Scaffolding complet dès T1 ✓ Retenue
Mettre en place toute la structure en une seule tâche : routes, lib, types, migrations SQL, middleware, config Vercel.

**Avantages** : base solide et cohérente dès le départ, zéro dette technique structurelle.
**Inconvénients** : tâche volumineuse.

### Option B — Scaffolding minimal
Créer uniquement Next.js + Supabase Auth, ajouter le reste au fil des tâches.

**Inconvénients** : risque de réarchitecturer en cours de route, incohérences entre tâches.

## Recommandation

Option A — le coût initial est justifié par la stabilité architecturale pour toutes les tâches suivantes.

## Impact S1 / S2

- **S1** : interfaces `Critere`, `ResultatEligibilite`, `Monument` + moteur déterministe `lib/s1/engine.ts` mis en place
- **S2** : interfaces `ContenuDossier`, `Template` + template DRAC v1.0 + route `/api/dossiers/generate`
