## ADDED Requirements

### Requirement: Page dashboard du dossier
Le système SHALL fournir une page `/dossiers/[id]` accessible uniquement à l'utilisateur propriétaire du dossier. La page MUST charger les données du dossier (monument, aide, contenu_genere, statut) depuis Supabase via Server Component. Si le dossier n'appartient pas à l'utilisateur connecté, la page DOIT retourner 404.

#### Scenario: Accès au tableau de bord du dossier
- **WHEN** l'utilisateur authentifié propriétaire accède à `/dossiers/[id]`
- **THEN** la page affiche les données du dossier : nom du monument, aide concernée, statut, et le contenu généré (sections)

#### Scenario: Accès non autorisé
- **WHEN** un utilisateur accède à `/dossiers/[id]` pour un dossier qui ne lui appartient pas
- **THEN** la page retourne 404 sans divulguer l'existence du dossier

#### Scenario: Dossier avec contenu non généré
- **WHEN** l'utilisateur accède à un dossier en `brouillon` sans `contenu_genere`
- **THEN** la page affiche un bouton "Générer le dossier" et un état vide pour les sections

---

### Requirement: Affichage et édition des sections générées
La page dashboard SHALL afficher chaque section du `contenu_genere` dans un composant éditable. L'utilisateur DOIT pouvoir modifier le contenu de chaque section. Toute modification MUST être sauvegardée via une Server Action `updateDossierSection(dossierId, sectionId, contenu)` avec vérification de l'ownership. Le champ `is_edite` DOIT être mis à `true` pour les sections modifiées manuellement.

#### Scenario: Affichage des sections générées
- **WHEN** le dossier a un `contenu_genere` avec des sections
- **THEN** chaque section est affichée avec son titre et son contenu textuel dans un composant éditable

#### Scenario: Modification d'une section
- **WHEN** l'utilisateur modifie le contenu d'une section et sauvegarde
- **THEN** le contenu mis à jour est persisté dans `contenu_genere` et `is_edite` passe à `true` pour cette section

#### Scenario: Indicateur de section modifiée manuellement
- **WHEN** une section a `is_edite: true`
- **THEN** un indicateur visuel distingue la section comme "modifiée manuellement"

---

### Requirement: Indicateur de progression du dossier
La page SHALL afficher un indicateur de progression basé sur : le nombre de sections renseignées, le statut de l'upload des pièces obligatoires (depuis la checklist), et le statut du dossier (`brouillon`, `en_cours`, `finalise`). La progression DOIT être calculée côté serveur.

#### Scenario: Progression avec sections complètes et pièces manquantes
- **WHEN** toutes les sections sont générées mais des pièces obligatoires manquent
- **THEN** l'indicateur affiche une progression partielle avec un message "X pièces manquantes"

#### Scenario: Dossier finalisé
- **WHEN** toutes les sections sont renseignées et toutes les pièces obligatoires uploadées
- **THEN** le bouton "Finaliser" devient actif et le statut peut passer à `finalise`

---

### Requirement: Incitation à la relecture humaine
La page dashboard MUST afficher un disclaimer visible et permanent : "Ce dossier a été généré automatiquement. Relisez et validez chaque section avant tout envoi." Ce message DOIT être présent avant le bouton d'export et ne DOIT pas pouvoir être masqué ou ignoré par l'utilisateur.

#### Scenario: Disclaimer affiché avant l'export
- **WHEN** l'utilisateur accède à la section d'export du dossier
- **THEN** le disclaimer de relecture obligatoire est affiché de manière bien visible avant tout bouton d'export

#### Scenario: Disclaimer non masquable
- **WHEN** l'utilisateur tente de masquer ou ignorer le disclaimer
- **THEN** le disclaimer reste affiché — aucune option de masquage n'est disponible
