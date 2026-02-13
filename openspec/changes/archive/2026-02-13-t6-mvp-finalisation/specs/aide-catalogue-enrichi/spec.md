## ADDED Requirements

### Requirement: Catalogue enrichi — 30 aides réelles minimum

Le projet MUST fournir un fichier `/lib/s1/seed/aides-enrichies.ts` exportant un tableau `Aide[]` d'au moins 30 aides réelles, vérifiées et structurées selon le schéma `Aide` existant. Un script `scripts/seed-aides-full.ts` MUST insérer ou mettre à jour ces données via le client `service_role` (upsert idempotent sur `slug`). Les données de démo existantes dans `002_seed_aides.sql` MUST être conservées (le script est additif, pas destructif).

#### Scenario: Couverture DRAC nationale

- **WHEN** on inspecte le tableau exporté par `aides-enrichies.ts`
- **THEN** au moins 3 aides portent `organisme` contenant "DRAC" ou "Ministère de la Culture", couvrant les monuments classés MH, les monuments inscrits MH, et le Fonds Incitatif et Qualitatif

#### Scenario: Couverture régions pilotes

- **WHEN** on inspecte le tableau exporté par `aides-enrichies.ts`
- **THEN** au moins 3 aides ont un critère géographique `region` égal à `"auvergne-rhone-alpes"` et au moins 2 aides ont un critère géographique `region` égal à `"grand-est"` (ou `"champagne-ardenne"` pour l'Aube)

#### Scenario: Couverture fondations privées

- **WHEN** on inspecte le tableau exporté par `aides-enrichies.ts`
- **THEN** au moins 4 aides proviennent de fondations privées (Fondation du Patrimoine label, Fondation du Patrimoine souscription, VMF, Sauvegarde de l'Art Français, Fondation de France, ou Fondation Total Énergies Nouvelles)

#### Scenario: Couverture Europe

- **WHEN** on inspecte le tableau exporté par `aides-enrichies.ts`
- **THEN** au moins 1 aide a `organisme` contenant "FEDER" ou "LEADER"

#### Scenario: Script seed idempotent

- **WHEN** `npx tsx scripts/seed-aides-full.ts` est exécuté deux fois de suite
- **THEN** aucune duplication n'est créée dans la table `aides` (upsert sur `slug`)

#### Scenario: Toutes les aides ont une source URL

- **WHEN** on inspecte chaque aide du tableau
- **THEN** le champ `source_url` est une URL valide (non vide) pointant vers la page officielle de l'aide

#### Scenario: Validation Zod avant insertion

- **WHEN** une aide du fichier échoue la validation Zod (ex. `criteres` malformé, `slug` manquant)
- **THEN** le script lève une erreur explicite et n'insère aucune aide

---

### Requirement: Couverture statut juridique propriétaire

Le catalogue enrichi MUST couvrir les différents types de propriétaires définis par le PRD. Pour chaque type de propriétaire (collectivité publique, privé, association), au moins 3 aides MUST être accessibles selon les critères `statut_juridique`.

#### Scenario: Aides réservées aux collectivités

- **WHEN** un utilisateur avec `statut_juridique = "collectivite"` lance le matching
- **THEN** les aides DRAC et les aides régionales de droit commun apparaissent dans les résultats éligibles

#### Scenario: Aides réservées aux propriétaires privés

- **WHEN** un utilisateur avec `statut_juridique = "prive"` lance le matching
- **THEN** les aides VMF, Sauvegarde de l'Art Français et les leviers fiscaux (Malraux, déduction travaux MH) apparaissent dans les résultats éligibles

#### Scenario: Aides accessibles aux associations

- **WHEN** un utilisateur avec `statut_juridique = "association"` lance le matching
- **THEN** les aides Fondation du Patrimoine et les aides État non-réservées aux collectivités apparaissent dans les résultats

---

### Requirement: Intégration des règles de cumul réelles

Chaque aide du catalogue enrichi MUST renseigner le champ `regles_cumul` JSONB selon les règles officielles connues. Pour les aides sans règle de cumul documentée, `regles_cumul` MUST être `{}` (objet vide, jamais `null`).

#### Scenario: Règle plafond 80% pour les aides État + région

- **WHEN** le simulateur calcule une combinaison incluant une aide DRAC et une aide région AuRA sur un même monument
- **THEN** le simulateur applique le plafond de financement public cumulé à 80% du montant des travaux

#### Scenario: Aide non cumulable

- **WHEN** une aide a `regles_cumul.non_cumulable_avec: ["aide-drac-mh-classe"]`
- **THEN** le simulateur exclut cette aide des combinaisons contenant `aide-drac-mh-classe`
