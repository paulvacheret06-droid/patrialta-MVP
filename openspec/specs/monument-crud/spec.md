## ADDED Requirements

### Requirement: List user monuments
Le système SHALL afficher la liste de tous les monuments appartenant à l'utilisateur connecté sur la page `/monuments`. La lecture MUST être protégée par RLS (chaque utilisateur ne voit que ses propres monuments). Chaque monument DOIT afficher un lien "Voir les aides éligibles" pointant vers `/monuments/[id]/aides`.

#### Scenario: Liste avec monuments existants
- **WHEN** un utilisateur authentifié accède à `/monuments` et possède des monuments en base
- **THEN** la page affiche chaque monument avec son nom, sa commune, son type de protection, et un lien "Voir les aides éligibles" vers `/monuments/[id]/aides`

#### Scenario: Liste vide
- **WHEN** un utilisateur authentifié accède à `/monuments` et n'a aucun monument en base
- **THEN** la page affiche un état vide avec un appel à l'action pour créer le premier monument

#### Scenario: Accès non authentifié
- **WHEN** un visiteur non authentifié tente d'accéder à `/monuments`
- **THEN** il est redirigé vers `/login`

---

### Requirement: Create monument with validation
Le système SHALL permettre à l'utilisateur authentifié de créer un monument via un formulaire. Les champs `nom` et `commune` MUST être présents et non vides. La Server Action MUST valider les entrées avec Zod avant insertion en base.

#### Scenario: Création réussie via autocomplétion
- **WHEN** l'utilisateur sélectionne un monument depuis l'autocomplétion Mérimée et soumet le formulaire
- **THEN** un enregistrement est inséré dans `public.monuments` avec `ref_merimee` renseigné et `is_verified_merimee = true`, et l'utilisateur voit le monument apparaître dans la liste

#### Scenario: Création réussie en saisie manuelle
- **WHEN** l'utilisateur saisit manuellement nom, commune, département et région et soumet le formulaire
- **THEN** un enregistrement est inséré avec `ref_merimee = null` et `is_verified_merimee = false`

#### Scenario: Validation échouée — champ requis manquant
- **WHEN** l'utilisateur soumet le formulaire sans renseigner le champ `nom`
- **THEN** un message d'erreur est affiché sous le champ concerné, aucune insertion n'est effectuée

---

### Requirement: Delete monument
Le système SHALL permettre à l'utilisateur de supprimer un de ses monuments. La suppression MUST être confirmée par l'utilisateur avant exécution. La RLS MUST empêcher la suppression d'un monument appartenant à un autre utilisateur.

#### Scenario: Suppression confirmée
- **WHEN** l'utilisateur clique sur "Supprimer" puis confirme l'action
- **THEN** le monument est retiré de `public.monuments` et disparaît de la liste

#### Scenario: Suppression annulée
- **WHEN** l'utilisateur clique sur "Supprimer" puis annule
- **THEN** le monument reste intact dans la liste

#### Scenario: Tentative de suppression d'un monument tiers
- **WHEN** un utilisateur tente de supprimer un monument qui ne lui appartient pas (via appel direct)
- **THEN** la RLS retourne une erreur et aucune ligne n'est supprimée
