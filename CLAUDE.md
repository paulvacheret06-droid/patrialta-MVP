# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

This is a new, empty repository. Run `/init` again once source code and project structure exist.

## Pre-authorized Permissions

Defined in `.claude/settings.json` — the following run without prompts:

- File ops: Read, Write, Edit
- Shell: `grep`, `ls`, `find`, `mv`, `mkdir`, `tree`, `touch`, `chmod`, `cat`
- Python: `python`, `python3 -m pytest`, `pytest`, `ruff`
- Git: `init`, `add`, `commit`, `remote add`, `branch`, `push`, `status`, `diff`, `log`
- GitHub CLI: `gh issue view`
- Web: `WebFetch` (all domains)
- Skills: all

## Context7

Toujours utiliser les outils MCP Context7 automatiquement (sans attendre une demande explicite) dans les cas suivants :

- Génération de code impliquant une bibliothèque ou un framework
- Étapes de configuration, d'installation ou d'intégration
- Documentation d'une bibliothèque ou d'une API

Workflow obligatoire : appeler `resolve-library-id` en premier pour obtenir l'identifiant Context7, puis `query-docs` pour récupérer la documentation à jour avant de générer du code ou des instructions.

---

## Aperçu du projet

PatriAlta est une plateforme SaaS de gestion du patrimoine historique qui aide les collectivités locales et les propriétaires privés de monuments historiques à identifier les aides financières auxquelles ils sont éligibles et à monter leurs dossiers de subvention.

**Proposition de valeur** : passer de "j'ai un monument" à "j'ai un dossier de subvention prêt" sans consultant.

Deux services principaux :
- **S1 — Mouline** : moteur d'identification des aides financières (matching déterministe, TypeScript pur, aucun LLM)
- **S2 — Montage** : générateur de dossiers de subvention assisté par IA (Claude API)

---

## Architecture globale

Stack technique :
- **Framework** : Next.js 15 (App Router) + TypeScript strict
- **Base de données** : Supabase (PostgreSQL, Frankfurt EU) avec RLS
- **Auth** : Supabase Auth (sessions anonymes pour onboarding progressif)
- **Hébergement** : Vercel Pro (Frankfurt EU)
- **Email** : Brevo
- **PDF** : @react-pdf/renderer (runtime Node.js uniquement — incompatible Edge Runtime)
- **Word** : docx (npm)
- **IA** : Claude API — S2 uniquement (`claude-sonnet-4-5-20250929` / `claude-opus-4-6`)
- **Styling** : Tailwind CSS + shadcn/ui

---

## Style visuel

- Interface claire et minimaliste
- Pas de mode sombre pour le MVP
- Composants : Tailwind CSS + shadcn/ui

---

## Contraintes et Politiques

- **NE JAMAIS exposer les clés API au client** — toutes les clés restent côté serveur (Server Actions, Route Handlers)
- `SUPABASE_SERVICE_ROLE_KEY` : ne jamais utiliser côté client, ne jamais logger, ne jamais committer
- Le moteur de matching S1 est 100% déterministe, TypeScript pur — aucun LLM pour le calcul d'éligibilité
- RLS PostgreSQL actif sur toutes les tables utilisateur
- Rate limiting sur `/api/dossiers/generate` : 10 générations/heure par `user_id`

---

## Dépendances

- Préférer les composants existants (shadcn/ui) plutôt que d'ajouter de nouvelles bibliothèques UI
- Épingler toutes les dépendances dans `package.json` avant le premier commit

---

## Tests interface

À la fin de chaque développement impliquant l'interface graphique, tester avec le skill `playwright-skill` :
- L'interface doit être responsive
- L'interface doit être fonctionnelle
- L'interface doit répondre au besoin développé

---

## Documentation

- **PRD** : [`PRD.md`](./PRD.md) — Spécifications fonctionnelles complètes du MVP
- **Architecture** : [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Architecture technique détaillée

---

## Spécifications

Toutes les spécifications doivent être rédigées en français, y compris les specs OpenSpec (sections Purpose et Scenarios). Seuls les titres de Requirements doivent rester en anglais avec les mots-clés SHALL/MUST pour la validation OpenSpec.
