## ADDED Requirements

### Requirement: Search monuments via Mérimée API
Le système SHALL proposer une autocomplétion des monuments via le proxy `/api/merimee/search` lorsque l'utilisateur saisit au minimum 2 caractères dans le champ de recherche. Les requêtes MUST être déclenchées avec un debounce de 300 ms. Les résultats MUST être mis en cache 24h côté Next.js (fetch natif avec `next: { revalidate: 86400 }`).

#### Scenario: Recherche avec résultats
- **WHEN** l'utilisateur saisit au moins 2 caractères dans le champ de recherche
- **THEN** une liste déroulante affiche jusqu'à 10 résultats correspondants (nom du monument + commune)

#### Scenario: Recherche sans résultats
- **WHEN** l'utilisateur saisit une chaîne ne correspondant à aucun monument dans Mérimée
- **THEN** la liste déroulante affiche un message "Aucun résultat — utilisez la saisie manuelle"

#### Scenario: Requête trop courte
- **WHEN** l'utilisateur saisit moins de 2 caractères
- **THEN** aucune requête n'est envoyée à l'API et la liste déroulante reste fermée

---

### Requirement: Pre-fill form on Mérimée result selection
Le système SHALL pré-remplir automatiquement les champs du formulaire (commune, département, région, type de protection, référence Mérimée) lorsque l'utilisateur sélectionne un résultat dans la liste déroulante.

#### Scenario: Sélection d'un résultat Mérimée
- **WHEN** l'utilisateur clique sur un résultat dans la liste déroulante
- **THEN** les champs commune, département, région, `ref_merimee` et `type_protection` sont pré-remplis avec les données Mérimée, et le champ de recherche affiche le nom du monument sélectionné

---

### Requirement: Graceful fallback to manual entry
Le système SHALL basculer en mode saisie manuelle si l'API Mérimée est indisponible ou si l'utilisateur active le toggle "Je ne trouve pas mon monument". En mode manuel, tous les champs sont librement éditables sans autocomplétion.

#### Scenario: API Mérimée indisponible
- **WHEN** le proxy `/api/merimee/search` retourne `{ fallback: true }` suite à une erreur
- **THEN** l'autocomplétion est désactivée et un message indique "Saisie manuelle disponible" sans bloquer la saisie

#### Scenario: Activation manuelle du mode manuel
- **WHEN** l'utilisateur clique sur le lien "Je ne trouve pas mon monument"
- **THEN** le formulaire bascule en mode manuel : tous les champs sont éditables, l'autocomplétion est masquée
