## ADDED Requirements

### Requirement: Upload de pièces justificatives
Le système SHALL permettre à l'utilisateur d'uploader des pièces justificatives pour un dossier via une Server Action `uploadDocument(dossierId, file, typePiece)`. Les fichiers MUST être stockés dans le bucket Supabase Storage `dossiers-pieces` dans un chemin `[user_id]/[dossier_id]/[type_piece]/[filename]`. Les types MIME acceptés MUST être limités à : `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/jpeg`, `image/png`. La taille maximale par fichier DOIT être de 10 Mo. L'ownership du dossier MUST être vérifié avant tout upload.

#### Scenario: Upload d'un PDF conforme
- **WHEN** l'utilisateur uploade un fichier PDF de 3 Mo pour un dossier qui lui appartient
- **THEN** le fichier est stocké dans Supabase Storage et une entrée est créée dans `documents` avec `statut = 'uploade'`

#### Scenario: Upload d'un fichier dépassant 10 Mo
- **WHEN** l'utilisateur tente d'uploader un fichier de 15 Mo
- **THEN** la Server Action retourne une erreur de validation et aucun fichier n'est stocké

#### Scenario: Type MIME non autorisé
- **WHEN** l'utilisateur tente d'uploader un fichier `.xlsx`
- **THEN** la Server Action retourne une erreur "Type de fichier non autorisé" et rejette le fichier

#### Scenario: Upload pour un dossier tiers
- **WHEN** un utilisateur tente d'uploader une pièce pour un dossier appartenant à un autre utilisateur
- **THEN** la Server Action retourne une erreur d'autorisation sans effectuer l'upload

---

### Requirement: Checklist dynamique des pièces requises
La page dossier SHALL afficher une checklist des pièces justificatives requises par l'organisme, dérivée du template de l'aide concernée (`pieces_justificatives` par section). Chaque pièce DOIT avoir un statut visuel : `manquant` (rouge), `uploade` (orange), `valide` (vert). L'utilisateur DOIT pouvoir uploader une pièce directement depuis la checklist.

#### Scenario: Checklist avec pièces manquantes
- **WHEN** l'utilisateur accède à la checklist d'un dossier sans pièces uploadées
- **THEN** toutes les pièces requises sont listées avec le statut "manquant" en rouge et un bouton "Uploader"

#### Scenario: Pièce uploadée — statut mis à jour
- **WHEN** l'utilisateur uploade une pièce depuis la checklist
- **THEN** le statut de cette pièce passe à `uploade` en orange

#### Scenario: Nombre de pièces manquantes dans l'indicateur de progression
- **WHEN** des pièces obligatoires ont le statut `manquant`
- **THEN** l'indicateur de progression du dossier affiche le nombre de pièces manquantes

---

### Requirement: Accès sécurisé aux documents uploadés
Les fichiers stockés dans Supabase Storage MUST être accessibles uniquement via des signed URLs avec une durée d'expiration de 1 heure. Aucune URL publique directe ne DOIT être exposée. La génération de signed URL MUST vérifier que le document appartient à l'utilisateur connecté.

#### Scenario: Accès à un document via signed URL
- **WHEN** l'utilisateur clique sur un document uploadé dans la checklist
- **THEN** une signed URL valide 1 heure est générée et ouvre le fichier dans un nouvel onglet

#### Scenario: Signed URL expirée
- **WHEN** une signed URL est accédée après expiration
- **THEN** Supabase Storage retourne une erreur d'accès — l'utilisateur doit rafraîchir la page pour obtenir une nouvelle URL

---

### Requirement: Suppression d'un document uploadé
Le système SHALL permettre à l'utilisateur de supprimer un document uploadé via une Server Action `deleteDocument(documentId)`. La suppression MUST effacer le fichier dans Supabase Storage ET l'entrée dans `documents`. L'ownership MUST être vérifié via RLS.

#### Scenario: Suppression d'un document
- **WHEN** l'utilisateur clique "Supprimer" sur un document uploadé et confirme
- **THEN** le fichier est supprimé de Supabase Storage et la ligne `documents` est supprimée, la pièce repasse à `manquant` dans la checklist

#### Scenario: Suppression refusée pour document tiers
- **WHEN** un utilisateur tente de supprimer un document appartenant à un autre utilisateur
- **THEN** la Server Action retourne une erreur d'autorisation sans effectuer de suppression
