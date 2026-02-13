## ADDED Requirements

### Requirement: Calculer les combinaisons d'aides finançables
Le système SHALL fournir une Server Action `calculateSimulation(monumentId: string, budgetEstime: number)` qui charge les `eligibility_results` éligibles du monument, applique les règles de cumul (`regles_cumul` JSONB), et retourne un tableau de `SimulationResult` avec montants estimés par aide, total estimé et taux de couverture. Cette action MUST vérifier l'ownership du monument via RLS avant tout calcul. La logique de calcul MUST rester côté serveur — aucune logique de cumul ne DOIT être exposée côté client.

#### Scenario: Simulation avec budget et aides éligibles
- **WHEN** l'utilisateur soumet un budget estimé de travaux pour un monument ayant des aides éligibles
- **THEN** la Server Action retourne les combinaisons d'aides avec montant estimé par aide, total estimé et taux de couverture du budget

#### Scenario: Respect du plafond de financement public
- **WHEN** la somme des aides dépasse le plafond de financement public défini dans `regles_cumul` (ex : 80%)
- **THEN** la combinaison est marquée `respecte_plafond: false` et le montant est plafonné à `budget_estime × plafond_financement_public`

#### Scenario: Monument sans aides éligibles
- **WHEN** le monument n'a aucune aide avec `est_eligible: true` dans `eligibility_results`
- **THEN** la Server Action retourne un tableau vide de combinaisons sans erreur

#### Scenario: Tentative d'accès à un monument tiers
- **WHEN** un utilisateur appelle `calculateSimulation` avec un `monumentId` appartenant à un autre utilisateur
- **THEN** la Server Action retourne une erreur d'autorisation sans effectuer le calcul

---

### Requirement: Affichage du simulateur sur la page aides
Le système SHALL intégrer une interface de simulateur sur la page `/monuments/[id]/aides` permettant à l'utilisateur de saisir un budget estimé et de déclencher le calcul. Le résultat DOIT afficher : la liste des aides retenues avec montant estimé, le total cumulé estimé, le taux de couverture en pourcentage, et une mention si le plafond de financement public est respecté.

#### Scenario: Saisie du budget et affichage du résultat
- **WHEN** l'utilisateur saisit un budget estimé et clique sur "Simuler"
- **THEN** les résultats de simulation s'affichent sous le formulaire avec les montants par aide et le total

#### Scenario: Budget non renseigné
- **WHEN** l'utilisateur soumet le simulateur sans saisir de budget
- **THEN** un message de validation est affiché et aucun appel serveur n'est effectué

#### Scenario: Mention du plafond dépassé
- **WHEN** la simulation retourne `respecte_plafond: false` pour une combinaison
- **THEN** un avertissement visuel indique que le plafond de financement public cumulé est atteint
