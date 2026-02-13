## MODIFIED Requirements

### Requirement: Seed data — 10 aides représentatives
Le projet MUST fournir un fichier `/lib/s1/seed/aides.ts` exportant un tableau `Aide[]` d'au moins **30** aides couvrant : au moins 3 aides DRAC nationales (MH classé, MH inscrit, Fonds Incitatif et Qualitatif), au moins 3 aides région AuRA, au moins 2 aides région Grand Est (ou Champagne-Ardenne), au moins 1 aide par département pilote (Rhône, Ain, Aube), au moins 4 aides fondations privées (Fondation du Patrimoine ×2, VMF, Sauvegarde de l'Art Français), au moins 1 aide Europe (FEDER ou LEADER). Un script `scripts/seed-aides.ts` MUST insérer ces données via le client `service_role`.

#### Scenario: Seed exécuté sans erreur

- **WHEN** `npx tsx scripts/seed-aides.ts` est exécuté sur une base vide
- **THEN** au moins 30 lignes sont insérées dans `aides` sans erreur

#### Scenario: Re-run idempotent

- **WHEN** le script seed est exécuté une deuxième fois
- **THEN** aucune duplication n'est créée (upsert sur `slug`)

#### Scenario: Validation Zod avant insertion

- **WHEN** une aide du seed échoue la validation Zod (ex. `criteres` malformé)
- **THEN** le script lève une erreur explicite et n'insère rien
