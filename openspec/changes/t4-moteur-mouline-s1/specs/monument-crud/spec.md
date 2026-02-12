## MODIFIED Requirements

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
