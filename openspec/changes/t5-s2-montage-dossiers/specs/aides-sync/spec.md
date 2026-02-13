## ADDED Requirements

### Requirement: Route Handler de synchronisation Aides-territoires
Le système SHALL fournir un Route Handler `GET /api/aides/sync` protégé par le header `Authorization: Bearer ${CRON_SECRET}`. Toute requête sans ce header ou avec un secret invalide DOIT retourner HTTP 401. La route MUST être déclenchée par Vercel Cron (`0 3 * * *`) et ne DOIT jamais être exposée publiquement.

#### Scenario: Déclenchement avec secret valide
- **WHEN** Vercel Cron appelle `/api/aides/sync` avec le header `Authorization: Bearer <CRON_SECRET>` correct
- **THEN** la synchronisation démarre et retourne HTTP 200 avec un rapport de sync (nombre d'aides insérées/mises à jour/ignorées)

#### Scenario: Appel sans header d'autorisation
- **WHEN** une requête arrive sur `/api/aides/sync` sans header `Authorization`
- **THEN** la route retourne HTTP 401 sans effectuer aucune opération

#### Scenario: Appel avec secret invalide
- **WHEN** une requête arrive avec un secret `Authorization` incorrect
- **THEN** la route retourne HTTP 401

---

### Requirement: Récupération et validation des aides depuis l'API Aides-territoires
Le système SHALL récupérer les aides patrimoniales depuis l'API Aides-territoires (filtre thématique patrimoine), valider chaque objet reçu avec un schema Zod `AideTerritorieSchema`, et ignorer silencieusement les objets invalides en les loggant. Si plus de 20% des objets reçus sont invalides, une alerte email DOIT être envoyée à l'admin (Brevo).

#### Scenario: Objet valide — insertion ou mise à jour
- **WHEN** l'API retourne un objet aide conforme au schema Zod
- **THEN** l'aide est insérée ou mise à jour dans `public.aides` via upsert sur `external_id`

#### Scenario: Objet invalide — ignoré et loggé
- **WHEN** l'API retourne un objet aide non conforme au schema Zod
- **THEN** l'objet est ignoré, une entrée de log est créée, et la sync continue sans erreur

#### Scenario: Taux d'invalidité élevé — alerte admin
- **WHEN** plus de 20% des objets reçus de l'API sont invalides sur un même run
- **THEN** un email d'alerte est envoyé à l'admin via Brevo signalant un possible changement de schéma API

---

### Requirement: Diff — mise à jour uniquement des aides modifiées
Le système SHALL comparer les données reçues avec les données existantes en base via `external_id`. Seules les aides dont le contenu a changé DOIVENT être mises à jour. Le champ `last_synced_at` MUST être mis à jour pour toutes les aides traitées (modifiées ou non). Les aides non présentes dans la réponse API et ayant `is_active: true` DOIVENT être marquées `is_active: false` (soft delete).

#### Scenario: Aide existante non modifiée
- **WHEN** une aide reçue de l'API a un `external_id` existant en base et un contenu identique
- **THEN** seul le champ `last_synced_at` est mis à jour, les autres champs restent inchangés

#### Scenario: Aide existante modifiée
- **WHEN** une aide reçue a un `external_id` existant mais un contenu différent
- **THEN** tous les champs modifiés sont mis à jour et `last_synced_at` est mis à jour

#### Scenario: Aide supprimée de l'API
- **WHEN** une aide présente en base avec `is_active: true` n'est plus retournée par l'API
- **THEN** `is_active` est mis à `false` (soft delete — pas de suppression physique)

---

### Requirement: Alerte admin en cas d'échec de sync
Si la sync échoue complètement (erreur réseau, API indisponible, exception non gérée), le système MUST envoyer un email d'alerte à l'adresse admin configurée via Brevo et retourner HTTP 500 avec un message d'erreur structuré.

#### Scenario: Sync échouée — alerte email
- **WHEN** la sync lève une exception non gérée (ex : API Aides-territoires indisponible)
- **THEN** un email d'alerte est envoyé à l'admin Brevo et la route retourne HTTP 500

#### Scenario: Sync réussie partiellement
- **WHEN** la sync traite tous les objets valides sans exception globale mais avec des objets invalides ignorés
- **THEN** la route retourne HTTP 200 avec un rapport indiquant le nombre d'objets ignorés
