## ADDED Requirements

### Requirement: Landing page — proposition de valeur

Le système SHALL afficher une landing page à la route `/` présentant la proposition de valeur de PatriAlta. Cette page MUST être accessible sans authentification. Elle MUST inclure : un hero avec titre et sous-titre, les 4 piliers différenciants (exhaustivité, proactivité, accessibilité, continuité S1→S2), et un CTA "Commencer gratuitement" redirigeant vers `/auth/signup` ou `/auth/login`.

#### Scenario: Accès anonyme à la landing

- **WHEN** un visiteur non authentifié accède à `/`
- **THEN** la landing page s'affiche avec hero, piliers et CTA — sans redirection vers `/auth/login`

#### Scenario: Redirection utilisateur connecté

- **WHEN** un utilisateur authentifié accède à `/`
- **THEN** il est redirigé vers `/monuments` (dashboard principal)

#### Scenario: CTA landing fonctionnel

- **WHEN** un visiteur clique sur "Commencer gratuitement"
- **THEN** il est redirigé vers la page d'inscription `/auth/signup`

#### Scenario: Rendu responsive landing

- **WHEN** la page est affichée sur mobile (375px)
- **THEN** le hero et les 4 piliers sont lisibles sans défilement horizontal, le CTA est accessible sans zoom

---

### Requirement: État vide — premier monument

La page `/monuments` MUST afficher un état vide explicite lorsque l'utilisateur n'a encore aucun monument enregistré. Cet état MUST inclure un message contextuel, une icône, et un CTA "Ajouter mon premier monument" pointant vers le formulaire d'ajout.

#### Scenario: État vide premier accès

- **WHEN** un utilisateur connecté sans monument accède à `/monuments`
- **THEN** l'état vide s'affiche avec titre, description du bénéfice et CTA — aucune liste vide sans contexte

#### Scenario: Disparition de l'état vide

- **WHEN** l'utilisateur ajoute son premier monument
- **THEN** la page `/monuments` affiche la liste normale avec la carte du monument

---

### Requirement: Fil de navigation S1 → S2

L'interface MUST guider l'utilisateur du matching S1 vers le montage S2 de manière visible. Sur la page d'aides éligibles `/monuments/[id]/aides`, chaque aide éligible (`est_eligible: true`) MUST afficher un CTA "Démarrer un dossier" visible et accessible. Un indicateur de progression global (étapes 1 à 4 du parcours PRD) SHOULD être visible sur les pages principales du parcours.

#### Scenario: CTA dossier visible sur aide éligible

- **WHEN** un utilisateur consulte une aide éligible sur `/monuments/[id]/aides`
- **THEN** un bouton "Démarrer un dossier" est visible sur la carte de l'aide, sans nécessiter de scroll

#### Scenario: Absence de CTA sur aide non éligible

- **WHEN** une aide a `est_eligible: false`
- **THEN** aucun CTA "Démarrer un dossier" n'apparaît sur sa carte

---

### Requirement: Footer global avec navigation légale

Un composant `Footer` MUST être présent sur toutes les pages de l'application (hors routes `/api/*`). Il MUST contenir au minimum : le nom "PatriAlta", les liens vers `/legal/cgu`, `/legal/mentions-legales`, `/legal/confidentialite`, et l'année en cours.

#### Scenario: Footer présent sur les pages principales

- **WHEN** un utilisateur navigue sur `/monuments`, `/monuments/[id]/aides`, ou `/dossiers/[id]`
- **THEN** le footer est visible en bas de page avec les 3 liens légaux

#### Scenario: Footer absent sur les routes API

- **WHEN** une requête est faite à `/api/*`
- **THEN** aucun footer HTML n'est inclus dans la réponse
