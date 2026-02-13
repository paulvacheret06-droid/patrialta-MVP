## ADDED Requirements

### Requirement: Bouton Export PDF sur la page aides
La page `/monuments/[id]/aides` SHALL afficher un bouton "Exporter PDF" qui déclenche le téléchargement du PDF de synthèse via `GET /api/monuments/[id]/export-pdf`. Le bouton DOIT être visible uniquement si au moins une aide éligible est présente. Un indicateur de chargement DOIT être affiché pendant la génération.

#### Scenario: Export PDF déclenché depuis la page aides
- **WHEN** l'utilisateur clique "Exporter PDF" sur la page aides d'un monument avec des aides éligibles
- **THEN** le PDF est généré et téléchargé automatiquement par le navigateur

#### Scenario: Bouton masqué si aucune aide éligible
- **WHEN** aucune aide n'a `est_eligible: true` pour ce monument
- **THEN** le bouton "Exporter PDF" n'est pas rendu dans l'interface

---

### Requirement: CTA "Démarrer un dossier" sur chaque aide éligible
Pour chaque aide avec `est_eligible: true`, la page SHALL afficher un bouton ou lien "Démarrer un dossier" qui redirige vers le flow de création de dossier S2. Ce CTA DOIT être distinct visuellement du lien "Source officielle".

#### Scenario: CTA visible sur aide éligible
- **WHEN** une aide a `est_eligible: true`
- **THEN** un bouton "Démarrer un dossier" est visible sur la carte de l'aide

#### Scenario: CTA absent sur aide non éligible ou à vérifier
- **WHEN** une aide a `est_eligible: false` ou `est_eligible: null`
- **THEN** le bouton "Démarrer un dossier" n'est pas rendu pour cette aide

---

### Requirement: Simulateur de financement intégré
La page `/monuments/[id]/aides` SHALL afficher une section "Simulateur de financement" avec un champ budget estimé (en euros) et un bouton "Simuler". La soumission DOIT appeler la Server Action `calculateSimulation` et afficher les résultats sans rechargement de page. La section simulateur DOIT être rendue uniquement si au moins une aide éligible est présente.

#### Scenario: Simulateur affiché si aides éligibles
- **WHEN** la page aides charge et au moins une aide est éligible
- **THEN** la section simulateur est affichée avec un champ budget et un bouton "Simuler"

#### Scenario: Résultats simulateur affichés après soumission
- **WHEN** l'utilisateur saisit un budget et clique "Simuler"
- **THEN** les combinaisons d'aides avec montants estimés et taux de couverture s'affichent sous le formulaire

## MODIFIED Requirements

### Requirement: Lien vers source officielle de l'aide
Pour chaque aide affichée, la page SHALL afficher un lien vers `source_url` ouvrant dans un nouvel onglet. Si `source_url` est absent, le lien ne DOIT pas être affiché. Le lien "Voir la source officielle" DOIT être positionné de manière secondaire par rapport au CTA "Démarrer un dossier".

#### Scenario: Lien source affiché
- **WHEN** une aide a un `source_url` renseigné
- **THEN** un lien "Voir la source officielle" est visible et pointe vers l'URL en target `_blank`

#### Scenario: Pas de lien si source absente
- **WHEN** une aide n'a pas de `source_url`
- **THEN** aucun lien source n'est rendu dans la carte de l'aide

#### Scenario: Hiérarchie visuelle CTA vs source
- **WHEN** une aide éligible a un `source_url` renseigné
- **THEN** le bouton "Démarrer un dossier" est visuellement plus proéminent que le lien "Voir la source officielle"
