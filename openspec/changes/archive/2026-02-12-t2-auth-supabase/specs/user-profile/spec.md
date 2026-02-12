## ADDED Requirements

### Requirement: Création du profil à l'inscription
Le système SHALL créer un enregistrement dans `public.profiles` lors de l'inscription, avec les champs `statut_juridique` (collectivite / prive / association) et `commune` fournis par l'utilisateur. Le champ `user_id` MUST correspondre à l'`id` de l'utilisateur dans `auth.users`.

#### Scenario: Profil créé avec statut collectivité
- **WHEN** l'utilisateur s'inscrit en sélectionnant "Collectivité" et en renseignant une commune
- **THEN** un enregistrement `profiles` est inséré avec `statut_juridique = 'collectivite'` et `commune` renseignée

#### Scenario: Profil créé avec statut privé
- **WHEN** l'utilisateur s'inscrit en sélectionnant "Propriétaire privé"
- **THEN** un enregistrement `profiles` est inséré avec `statut_juridique = 'prive'`

#### Scenario: Profil créé avec statut association
- **WHEN** l'utilisateur s'inscrit en sélectionnant "Association"
- **THEN** un enregistrement `profiles` est inséré avec `statut_juridique = 'association'`

#### Scenario: Échec de création du profil
- **WHEN** l'insert dans `public.profiles` échoue après la création du compte `auth.users`
- **THEN** le système affiche un message d'erreur invitant l'utilisateur à compléter son profil, sans bloquer la connexion

---

### Requirement: Lecture du profil utilisateur connecté
Le système SHALL permettre aux Server Components de l'app de lire le profil de l'utilisateur connecté depuis `public.profiles`. La lecture MUST être protégée par RLS (lecture du propriétaire uniquement).

#### Scenario: Profil accessible dans le layout app
- **WHEN** un utilisateur authentifié accède à une page de l'app
- **THEN** le layout app peut lire `statut_juridique` et `commune` depuis `public.profiles` via le client Supabase server

#### Scenario: Profil inaccessible pour un autre utilisateur
- **WHEN** un utilisateur tente de lire le profil d'un autre utilisateur via l'API Supabase
- **THEN** la RLS retourne zéro résultat

---

### Requirement: Détection de profil absent dans le layout app
Le layout app SHALL détecter si l'utilisateur connecté ne possède pas de profil dans `public.profiles` et SHALL afficher une notification invitant à compléter les informations.

#### Scenario: Profil absent après connexion
- **WHEN** un utilisateur authentifié accède au layout app et qu'aucun enregistrement `profiles` ne correspond à son `user_id`
- **THEN** une bannière ou notification est affichée : "Complétez votre profil pour accéder à toutes les fonctionnalités."
