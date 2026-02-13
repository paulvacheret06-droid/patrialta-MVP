## ADDED Requirements

### Requirement: Création d'un dossier de subvention
Le système SHALL permettre à l'utilisateur authentifié de créer un dossier pour une aide éligible donnée via une Server Action `createDossier(monumentId, aideId)`. La Server Action MUST vérifier que l'aide est bien dans les `eligibility_results` du monument avec `est_eligible: true`. Un nouveau `dossier` est inséré avec `statut = 'brouillon'` et `contenu_genere = null`. Un seul dossier actif (non archivé) par couple (monument, aide) DOIT être maintenu — si un dossier existant existe, l'utilisateur est redirigé vers celui-ci.

#### Scenario: Création réussie depuis la page aides
- **WHEN** l'utilisateur clique "Démarrer un dossier" sur une aide éligible
- **THEN** un dossier est créé en base avec `statut = 'brouillon'` et l'utilisateur est redirigé vers `/dossiers/[id]`

#### Scenario: Dossier déjà existant pour ce couple
- **WHEN** un dossier existe déjà pour le même monument et la même aide
- **THEN** l'utilisateur est redirigé vers le dossier existant sans créer de doublon

#### Scenario: Aide non éligible — création bloquée
- **WHEN** l'utilisateur tente de créer un dossier pour une aide non éligible
- **THEN** la Server Action retourne une erreur et aucun dossier n'est créé

---

### Requirement: Génération du contenu du dossier via Claude API streaming
Le système SHALL fournir un Route Handler `POST /api/dossiers/generate` qui génère le contenu du dossier via Claude API (`claude-sonnet-4-5-20250929`) en streaming SSE. La route MUST déclarer `export const runtime = 'nodejs'`. La route MUST vérifier le JWT Supabase et que le `dossier_id` appartient à `auth.uid()` avant tout appel à l'API Claude. Un rate limit de 10 générations/heure par `user_id` DOIT être appliqué. Le contenu est sauvegardé progressivement dans `dossiers.contenu_genere` au fil du streaming.

#### Scenario: Génération réussie — streaming affiché en temps réel
- **WHEN** l'utilisateur clique "Générer le dossier" sur un dossier en brouillon
- **THEN** le contenu des sections apparaît progressivement dans l'interface au fil du streaming SSE

#### Scenario: Rate limit dépassé
- **WHEN** l'utilisateur a déjà effectué 10 générations dans l'heure en cours
- **THEN** la route retourne HTTP 429 avec un message indiquant l'heure de réinitialisation du compteur

#### Scenario: Erreur API Claude 529 — retry automatique
- **WHEN** l'API Claude retourne une erreur 529 (overloaded)
- **THEN** le système effectue jusqu'à 3 tentatives avec backoff exponentiel (1s, 2s, 4s) avant de retourner une erreur à l'utilisateur

#### Scenario: Accès non autorisé au dossier
- **WHEN** un utilisateur tente de générer un dossier qui ne lui appartient pas
- **THEN** la route retourne HTTP 403 sans effectuer aucun appel à l'API Claude

---

### Requirement: Pré-remplissage depuis les données monument et S1
Le contexte envoyé à Claude SHALL inclure automatiquement : le nom, la commune, le département, la région, le type de protection du monument, les critères d'éligibilité remplis de l'aide (depuis `eligibility_results`), le statut juridique du propriétaire (depuis `profiles`), et les champs projet si renseignés (`type_travaux`, `budget_estime`). Aucune donnée personnelle directement identifiante (nom de personne physique, adresse précise) ne DOIT être incluse dans le prompt.

#### Scenario: Pré-remplissage avec données monument complètes
- **WHEN** le dossier est généré pour un monument avec toutes les données renseignées
- **THEN** le contenu généré intègre les informations du monument (commune, protection, époque) sans que l'utilisateur ait à les re-saisir

#### Scenario: Minimisation des données personnelles
- **WHEN** le prompt est construit pour l'envoi à Claude API
- **THEN** aucun nom de personne physique, numéro de téléphone ou adresse précise n'est inclus dans le prompt

---

### Requirement: Templates par organisme
Le système SHALL utiliser des templates TypeScript statiques dans `/lib/templates/` pour structurer le prompt envoyé à Claude. Chaque template DOIT implémenter l'interface `Template` avec `organisme_id`, `organisme_nom`, sections (id, titre, instructions_prompt, obligatoire, pieces_justificatives) et `prompt_version`. Trois templates initiaux MUST être fournis : `drac`, `aura` (conseil régional Auvergne-Rhône-Alpes), et `fdp` (Fondation du Patrimoine).

#### Scenario: Sélection automatique du template selon l'organisme
- **WHEN** l'utilisateur génère un dossier pour une aide DRAC
- **THEN** le template `drac` est utilisé automatiquement et le contenu généré suit la structure DRAC

#### Scenario: Template inconnu — fallback générique
- **WHEN** aucun template spécifique n'existe pour l'organisme de l'aide
- **THEN** un template générique est utilisé et `prompt_version = 'generic-v1'` est tracé dans le dossier
