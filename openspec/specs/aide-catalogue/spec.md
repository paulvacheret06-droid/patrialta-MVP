## ADDED Requirements

### Requirement: Define S1 TypeScript interfaces
Le système SHALL définir les interfaces TypeScript du Service 1 dans `/lib/types/s1.ts` avant tout code applicatif. Les interfaces obligatoires sont : `Critere`, `CritereType`, `CritereResult`, `Aide`, `ReglesCumul`, `ResultatEligibilite`. Ces types MUST être utilisés par le moteur de matching et les Server Actions.

#### Scenario: Interface Critere conforme
- **WHEN** on inspecte `/lib/types/s1.ts`
- **THEN** `Critere` expose les champs `id: string`, `type: CritereType`, `valeurs_acceptees: string[]`, `obligatoire: boolean`, `description_humaine: string`

#### Scenario: CritereType couvre tous les axes de filtrage
- **WHEN** on inspecte `CritereType`
- **THEN** l'union inclut au minimum : `protection_type`, `statut_juridique`, `region`, `departement`, `categorie_travaux`, `epoque`, `usage`

#### Scenario: ResultatEligibilite porte les trois listes
- **WHEN** on inspecte `ResultatEligibilite`
- **THEN** il expose `aide: Aide`, `criteres_remplis: CritereResult[]`, `criteres_manquants: CritereResult[]`, `criteres_a_verifier: CritereResult[]`, `est_eligible: boolean | null`

---

### Requirement: Table aides avec critères JSONB
Le système SHALL créer la table `public.aides` dans Supabase avec les colonnes : `id uuid`, `slug text UNIQUE NOT NULL`, `nom text NOT NULL`, `organisme text NOT NULL`, `description text`, `categorie text NOT NULL`, `source_url text`, `date_ouverture date`, `date_cloture date`, `montant_min numeric`, `montant_max numeric`, `taux_aide_max numeric`, `criteres jsonb NOT NULL DEFAULT '[]'`, `regles_cumul jsonb NOT NULL DEFAULT '{}'`, `created_at timestamptz`, `updated_at timestamptz`.

#### Scenario: Migration SQL crée la table aides
- **WHEN** la migration est appliquée sur une base vide
- **THEN** `public.aides` existe avec toutes les colonnes requises et la contrainte `UNIQUE` sur `slug`

#### Scenario: Contrainte de catégorie
- **WHEN** on tente d'insérer une aide avec une catégorie invalide (ex. `"autre"`)
- **THEN** Supabase retourne une erreur de contrainte `CHECK`

---

### Requirement: RLS aides — lecture publique, écriture service_role
La table `aides` MUST autoriser la lecture (`SELECT`) pour tous les rôles y compris `anon`. L'écriture (`INSERT`, `UPDATE`, `DELETE`) MUST être réservée au rôle `service_role`. Aucun utilisateur authentifié ne DOIT pouvoir modifier le catalogue.

#### Scenario: Lecture publique sans authentification
- **WHEN** un client anonyme exécute `SELECT * FROM aides`
- **THEN** toutes les lignes sont retournées sans erreur RLS

#### Scenario: Écriture bloquée pour les utilisateurs authentifiés
- **WHEN** un utilisateur authentifié (rôle `authenticated`) tente un `INSERT INTO aides`
- **THEN** la RLS retourne une erreur de permission

---

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
