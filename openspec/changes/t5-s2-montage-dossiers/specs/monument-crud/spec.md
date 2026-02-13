## ADDED Requirements

### Requirement: Formulaire mode projet sur un monument existant
Le système SHALL afficher un formulaire "Mode projet" sur la page de détail ou d'édition d'un monument permettant de renseigner : `description_projet` (textarea, optionnel), `type_travaux` (checkboxes multi-sélection parmi les 6 catégories), et `budget_estime` (champ numérique en euros, optionnel). La mise à jour MUST se faire via une Server Action `updateMonumentProjet(monumentId, data)` avec validation Zod et vérification de l'ownership.

#### Scenario: Ajout d'informations projet à un monument existant
- **WHEN** l'utilisateur renseigne `type_travaux` et `budget_estime` et sauvegarde
- **THEN** les champs sont persistés dans `public.monuments` via la Server Action

#### Scenario: Effacement des champs projet
- **WHEN** l'utilisateur vide tous les champs projet et sauvegarde
- **THEN** `type_travaux` est mis à `[]`, `description_projet` et `budget_estime` à `null`

#### Scenario: Budget invalide — validation
- **WHEN** l'utilisateur saisit un budget négatif ou non numérique
- **THEN** un message d'erreur de validation est affiché et aucune mise à jour n'est effectuée

## MODIFIED Requirements

### Requirement: List user monuments
Le système SHALL afficher la liste de tous les monuments appartenant à l'utilisateur connecté sur la page `/monuments`. La lecture MUST être protégée par RLS (chaque utilisateur ne voit que ses propres monuments). Chaque monument DOIT afficher un lien "Voir les aides éligibles" pointant vers `/monuments/[id]/aides`. Si un monument est en mode projet (au moins un champ projet renseigné), un badge "Mode projet" DOIT être affiché sur la carte.

#### Scenario: Liste avec monuments existants
- **WHEN** un utilisateur authentifié accède à `/monuments` et possède des monuments en base
- **THEN** la page affiche chaque monument avec son nom, sa commune, son type de protection, et un lien "Voir les aides éligibles" vers `/monuments/[id]/aides`

#### Scenario: Liste vide
- **WHEN** un utilisateur authentifié accède à `/monuments` et n'a aucun monument en base
- **THEN** la page affiche un état vide avec un appel à l'action pour créer le premier monument

#### Scenario: Accès non authentifié
- **WHEN** un visiteur non authentifié tente d'accéder à `/monuments`
- **THEN** il est redirigé vers `/login`

#### Scenario: Badge mode projet affiché
- **WHEN** un monument a au moins un champ projet renseigné (`type_travaux` non vide ou `budget_estime` renseigné)
- **THEN** un badge "Mode projet" est affiché sur la carte du monument dans la liste
