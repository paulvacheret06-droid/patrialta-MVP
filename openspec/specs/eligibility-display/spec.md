## ADDED Requirements

### Requirement: Page aides éligibles par monument
Le système SHALL fournir une page Server Component à `/monuments/[id]/aides` affichant les résultats d'éligibilité du monument identifié. La page MUST être accessible uniquement à l'utilisateur authentifié propriétaire du monument. Tout accès non autorisé DOIT rediriger vers `/login`.

#### Scenario: Accès authentifié au propriétaire
- **WHEN** l'utilisateur authentifié propriétaire du monument accède à `/monuments/[id]/aides`
- **THEN** la page se charge et affiche la liste des aides avec leur statut d'éligibilité

#### Scenario: Redirection si non authentifié
- **WHEN** un visiteur non authentifié accède à `/monuments/[id]/aides`
- **THEN** il est redirigé vers `/login`

#### Scenario: Erreur si monument inexistant ou appartenant à un tiers
- **WHEN** l'utilisateur accède à `/monuments/[id]/aides` pour un monument qui ne lui appartient pas
- **THEN** la page affiche une erreur 404 ou redirige vers `/monuments`

---

### Requirement: Affichage factuel des statuts d'éligibilité
La page SHALL afficher pour chaque aide : son nom, son organisme, sa catégorie, et le statut d'éligibilité global. Le statut MUST être exprimé en trois états visuellement distincts : éligible (✓ vert), non éligible (✗ rouge), à vérifier (? orange). Pour chaque aide, les critères SHALL être listés avec leur statut individuel.

#### Scenario: Aide éligible — affichage vert
- **WHEN** une aide a `est_eligible: true`
- **THEN** un indicateur visuel vert (✓) est affiché à côté du nom de l'aide

#### Scenario: Aide non éligible — affichage rouge
- **WHEN** une aide a `est_eligible: false`
- **THEN** un indicateur visuel rouge (✗) est affiché, et les critères non remplis sont listés avec leur `description_humaine`

#### Scenario: Aide à vérifier — affichage orange
- **WHEN** une aide a `est_eligible: null`
- **THEN** un indicateur visuel orange (?) est affiché avec la mention des critères manquants à compléter

---

### Requirement: Filtre par catégorie d'aide
La page SHALL permettre à l'utilisateur de filtrer les aides affichées par catégorie (`conservation`, `restauration`, `accessibilite`, `etudes`, `valorisation`, `urgence`). Le filtre DOIT être persisté dans l'URL via un paramètre `?categorie=`. L'état "toutes catégories" est le défaut.

#### Scenario: Filtrage par catégorie restauration
- **WHEN** l'utilisateur sélectionne le filtre "Restauration"
- **THEN** seules les aides avec `categorie = "restauration"` sont affichées

#### Scenario: URL reflète le filtre actif
- **WHEN** l'utilisateur sélectionne un filtre de catégorie
- **THEN** l'URL est mise à jour avec `?categorie=<valeur>` sans rechargement de page complet

---

### Requirement: Bouton Recalculer les aides
La page SHALL afficher un bouton "Recalculer" qui déclenche la Server Action `runMatching` pour le monument courant. Pendant le calcul, un indicateur de chargement DOIT être affiché. Après le calcul, la liste des aides DOIT être rafraîchie.

#### Scenario: Déclenchement du recalcul
- **WHEN** l'utilisateur clique sur "Recalculer"
- **THEN** `runMatching` est appelée, un indicateur de chargement est affiché, puis la liste est mise à jour avec les nouveaux résultats

#### Scenario: Absence de résultats pré-calculés au premier accès
- **WHEN** l'utilisateur accède à la page pour la première fois (aucun résultat dans `eligibility_results`)
- **THEN** le calcul est lancé automatiquement et les résultats sont affichés sans action manuelle

---

### Requirement: Lien vers source officielle de l'aide
Pour chaque aide affichée, la page SHALL afficher un lien vers `source_url` ouvrant dans un nouvel onglet. Si `source_url` est absent, le lien ne DOIT pas être affiché.

#### Scenario: Lien source affiché
- **WHEN** une aide a un `source_url` renseigné
- **THEN** un lien "Voir la source officielle" est visible et pointe vers l'URL en target `_blank`

#### Scenario: Pas de lien si source absente
- **WHEN** une aide n'a pas de `source_url`
- **THEN** aucun lien source n'est rendu dans la carte de l'aide
