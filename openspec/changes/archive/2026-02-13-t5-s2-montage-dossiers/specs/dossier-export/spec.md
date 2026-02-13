## ADDED Requirements

### Requirement: Export du dossier en PDF
Le système SHALL fournir un Route Handler `GET /api/dossiers/[id]/export?format=pdf` qui génère un PDF du dossier finalisé via `@react-pdf/renderer`. La route MUST déclarer `export const runtime = 'nodejs'`. La route MUST vérifier le JWT Supabase et que le dossier appartient à `auth.uid()`. Le PDF DOIT être retourné avec `Content-Type: application/pdf` et `Content-Disposition: attachment; filename="dossier-[aide]-[monument].pdf"`.

#### Scenario: Export PDF d'un dossier avec contenu complet
- **WHEN** l'utilisateur clique "Exporter en PDF" sur un dossier avec toutes les sections renseignées
- **THEN** le navigateur télécharge un PDF structuré avec les sections du dossier et les informations du monument et de l'aide

#### Scenario: Export PDF d'un dossier incomplet
- **WHEN** l'utilisateur exporte un dossier dont certaines sections sont vides
- **THEN** le PDF est généré avec les sections disponibles et une mention visuelle pour les sections manquantes

#### Scenario: Accès non autorisé à l'export PDF
- **WHEN** un utilisateur non authentifié ou non propriétaire appelle la route d'export
- **THEN** la route retourne HTTP 401 ou 403

---

### Requirement: Export du dossier en DOCX
Le système SHALL fournir un Route Handler `GET /api/dossiers/[id]/export?format=docx` qui génère un fichier Word éditable via la bibliothèque `docx`. La route MUST déclarer `export const runtime = 'nodejs'`. Le fichier DOIT être retourné avec `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document` et `Content-Disposition: attachment; filename="dossier-[aide]-[monument].docx"`.

#### Scenario: Export DOCX téléchargeable et éditable
- **WHEN** l'utilisateur clique "Exporter en Word"
- **THEN** un fichier `.docx` est téléchargé, ouvrable et éditable dans Microsoft Word ou LibreOffice

#### Scenario: Structure DOCX cohérente avec le template
- **WHEN** le dossier a été généré avec le template `drac`
- **THEN** le fichier DOCX respecte la structure du template DRAC (sections dans l'ordre, titres correspondants)

---

### Requirement: Contenu et structure du dossier exporté
Les deux formats d'export (PDF et DOCX) SHALL contenir : une page de garde avec le nom du monument, le nom de l'aide, l'organisme, et la date d'export ; chaque section du `contenu_genere` dans l'ordre défini par le template ; un pied de page avec la mention "Dossier préparé avec PatriAlta — validation humaine obligatoire avant envoi" ; et la liste des pièces justificatives requises avec leur statut d'upload.

#### Scenario: Page de garde complète
- **WHEN** un dossier est exporté en PDF ou DOCX
- **THEN** la première page contient le nom du monument, l'aide concernée, l'organisme et la date d'export

#### Scenario: Disclaimer de validation humaine présent
- **WHEN** n'importe quel format de dossier est exporté
- **THEN** la mention "validation humaine obligatoire avant envoi" est présente dans le pied de page de chaque page

#### Scenario: Checklist des pièces en annexe
- **WHEN** le dossier exporté a des pièces justificatives listées dans le template
- **THEN** une page "Annexe — Pièces justificatives" liste les pièces requises avec leur statut (uploadé / manquant)
