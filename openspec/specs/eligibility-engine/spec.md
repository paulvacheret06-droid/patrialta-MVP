## ADDED Requirements

### Requirement: Fonction pure de matching — matcherAide
Le système SHALL fournir une fonction pure `matcherAide(monument: Monument, aide: Aide): ResultatEligibilite` dans `/lib/s1/matching.ts`. Cette fonction MUST être déterministe, sans effet de bord, sans appel réseau ni accès base de données. Elle DOIT pouvoir être importée et testée unitairement sans contexte Next.js.

#### Scenario: Critère rempli — protection classé
- **WHEN** `matcherAide` est appelée avec un monument `protection_type: "classé"` et une aide dont le critère `protection_type` liste `["classé", "inscrit"]`
- **THEN** ce critère apparaît dans `criteres_remplis` du résultat

#### Scenario: Critère non rempli — statut juridique exclusif
- **WHEN** `matcherAide` est appelée avec un monument `statut_juridique: "prive"` et une aide dont le critère `statut_juridique` liste uniquement `["collectivite"]`
- **THEN** ce critère apparaît dans `criteres_manquants` et `est_eligible` est `false`

#### Scenario: Critère à vérifier — valeur inconnue
- **WHEN** `matcherAide` est appelée avec un monument dont `region` est `null` et une aide dont le critère `region` est `obligatoire: false`
- **THEN** ce critère apparaît dans `criteres_a_verifier` et `est_eligible` est `null`

#### Scenario: Éligibilité confirmée — tous critères obligatoires remplis
- **WHEN** tous les critères `obligatoire: true` d'une aide sont dans `criteres_remplis`
- **THEN** `est_eligible` est `true`

---

### Requirement: Fonction de matching par lot — matcherAides
Le système SHALL fournir `matcherAides(monument: Monument, aides: Aide[]): ResultatEligibilite[]` dans `/lib/s1/matching.ts`. Cette fonction MUST retourner un résultat par aide dans l'ordre du tableau d'entrée, sans modifier le tableau original.

#### Scenario: Résultats ordonnés et complets
- **WHEN** `matcherAides` est appelée avec un monument et 5 aides
- **THEN** le tableau retourné contient exactement 5 éléments dans le même ordre

---

### Requirement: Table eligibility_results avec RLS par propriétaire
Le système SHALL créer la table `public.eligibility_results` avec les colonnes : `id uuid`, `monument_id uuid REFERENCES monuments(id) ON DELETE CASCADE`, `aide_id uuid REFERENCES aides(id) ON DELETE CASCADE`, `user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE`, `criteres_remplis jsonb`, `criteres_manquants jsonb`, `criteres_a_verifier jsonb`, `est_eligible boolean`, `computed_at timestamptz`, contrainte `UNIQUE(monument_id, aide_id)`.

La RLS MUST garantir que chaque utilisateur ne voit et ne modifie que les résultats liés à ses propres monuments.

#### Scenario: Isolation RLS entre utilisateurs
- **WHEN** l'utilisateur A effectue un SELECT sur `eligibility_results`
- **THEN** seuls les résultats dont `user_id = auth.uid()` sont retournés

#### Scenario: Cascade suppression monument
- **WHEN** un monument est supprimé
- **THEN** tous les `eligibility_results` associés sont supprimés automatiquement

---

### Requirement: Server Action runMatching
Le système SHALL fournir une Server Action `runMatching(monumentId: string): Promise<ResultatEligibilite[]>` dans `/lib/actions/matching.ts`. Elle MUST : vérifier que l'utilisateur authentifié est propriétaire du monument, lire le monument depuis Supabase, lire toutes les aides depuis Supabase, appeler `matcherAides`, persister les résultats via upsert dans `eligibility_results`, retourner les résultats calculés.

#### Scenario: Matching complet et persistance
- **WHEN** `runMatching` est appelée avec un `monumentId` valide appartenant à l'utilisateur
- **THEN** des lignes sont upsertées dans `eligibility_results` pour chaque aide du catalogue, et la fonction retourne autant de `ResultatEligibilite` qu'il y a d'aides

#### Scenario: Accès refusé — monument d'un autre utilisateur
- **WHEN** `runMatching` est appelée avec un `monumentId` appartenant à un autre utilisateur
- **THEN** la Server Action retourne une erreur d'autorisation sans effectuer de calcul

#### Scenario: Idempotence — re-run sur même monument
- **WHEN** `runMatching` est appelée deux fois de suite sur le même monument
- **THEN** le nombre de lignes dans `eligibility_results` pour ce monument ne change pas (upsert)

---

### Requirement: Upsert eligibility_results via service_role
La Server Action `runMatching` MUST utiliser le client `service_role` (via `createServiceClient()`) pour l'opération upsert sur `eligibility_results`. La table ne dispose pas de policy RLS UPDATE — PostgreSQL bloque `INSERT ON CONFLICT DO UPDATE` dès qu'une policy UPDATE est absente, même si aucun conflit n'existe. L'ownership du monument MUST être vérifié au préalable via le client authentifié avant tout appel au client service_role.

#### Scenario: Upsert réussi sans policy UPDATE
- **WHEN** `runMatching` est appelée sur un monument appartenant à l'utilisateur
- **THEN** les lignes sont upsertées dans `eligibility_results` sans erreur RLS, grâce au client service_role

#### Scenario: Ownership vérifié avant service_role
- **WHEN** `runMatching` est appelée avec un `monumentId` d'un autre utilisateur
- **THEN** la vérification via le client authentifié échoue avant que le client service_role ne soit utilisé, garantissant qu'aucune donnée d'un autre utilisateur n'est écrasée
