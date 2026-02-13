## ADDED Requirements

### Requirement: Champs projet optionnels sur le monument
Le système SHALL permettre à l'utilisateur de renseigner des informations de projet sur un monument existant : `description_projet` (texte libre), `type_travaux` (tableau de valeurs parmi `conservation`, `restauration`, `accessibilite`, `etudes`, `valorisation`, `urgence`), et `budget_estime` (numérique positif). Ces champs MUST être optionnels — leur absence ne DOIT pas bloquer l'accès à S1 ou S2. La mise à jour MUST se faire via une Server Action avec validation Zod et vérification de l'ownership.

#### Scenario: Ajout d'informations projet à un monument existant
- **WHEN** l'utilisateur renseigne `type_travaux` et `budget_estime` dans le formulaire projet d'un monument
- **THEN** les champs sont persistés dans `public.monuments` et le monument passe en "mode projet"

#### Scenario: Champs projet non renseignés — mode généraliste par défaut
- **WHEN** un monument n'a aucun champ projet renseigné
- **THEN** la page aides fonctionne en mode généraliste sans erreur ni blocage

#### Scenario: Validation du budget négatif
- **WHEN** l'utilisateur saisit un `budget_estime` négatif ou non numérique
- **THEN** la Server Action retourne une erreur de validation et aucune mise à jour n'est effectuée

---

### Requirement: Filtrage des aides par type de travaux en mode projet
Lorsque `type_travaux` est renseigné sur le monument, le système SHALL filtrer les aides affichées pour ne montrer que celles dont `type_travaux_eligible` contient au moins un des types de travaux du monument. En l'absence de `type_travaux`, toutes les aides éligibles DOIVENT être affichées (mode généraliste).

#### Scenario: Monument avec type_travaux — filtrage affiné
- **WHEN** un monument a `type_travaux = ['restauration', 'conservation']` et l'utilisateur accède à `/monuments/[id]/aides`
- **THEN** seules les aides avec `type_travaux_eligible` contenant `restauration` ou `conservation` sont affichées

#### Scenario: Mode généraliste si type_travaux absent
- **WHEN** un monument n'a pas de `type_travaux` renseigné
- **THEN** toutes les aides éligibles sont affichées sans filtrage par type de travaux

#### Scenario: Indicateur mode projet actif
- **WHEN** le monument est en mode projet (au moins un champ projet renseigné)
- **THEN** la page aides affiche un indicateur visuel "Mode projet actif" avec les travaux concernés
