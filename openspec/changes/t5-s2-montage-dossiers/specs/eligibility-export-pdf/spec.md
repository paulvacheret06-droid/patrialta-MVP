## ADDED Requirements

### Requirement: Export PDF synthèse des aides éligibles
Le système SHALL fournir un Route Handler `GET /api/monuments/[id]/export-pdf` qui génère un PDF de synthèse des aides éligibles pour un monument. La route MUST déclarer `export const runtime = 'nodejs'` (incompatibilité `@react-pdf/renderer` avec Edge Runtime). La route MUST vérifier le JWT Supabase et l'ownership du monument avant toute génération. Le PDF DOIT être retourné avec `Content-Type: application/pdf` et `Content-Disposition: attachment`.

#### Scenario: Export PDF pour un monument éligible
- **WHEN** l'utilisateur authentifié propriétaire du monument clique sur "Exporter PDF"
- **THEN** le navigateur télécharge un fichier PDF nommé `aides-[nom-monument]-[date].pdf`

#### Scenario: Accès non autorisé à l'export
- **WHEN** un utilisateur non authentifié ou non propriétaire appelle la route d'export
- **THEN** la route retourne HTTP 401 ou 403 sans générer de PDF

#### Scenario: Monument sans aides éligibles
- **WHEN** le monument n'a aucune aide avec `est_eligible: true`
- **THEN** le PDF est généré avec une mention "Aucune aide éligible identifiée à ce jour"

---

### Requirement: Contenu et format du PDF de synthèse
Le PDF SHALL contenir : un en-tête avec le nom du monument, la commune, le type de protection, et la date de génération ; une section par aide éligible avec nom, organisme, catégorie, montant maximum, date limite de dépôt, et la liste des critères remplis ; un pied de page avec la mention "Document généré par PatriAlta — non contractuel". La mise en page DOIT être A4, lisible à l'impression et adaptée à une présentation au conseil municipal.

#### Scenario: Contenu minimal par aide éligible
- **WHEN** le PDF est généré pour un monument avec des aides éligibles
- **THEN** chaque aide affiche au minimum : nom, organisme, montant max (si renseigné), deadline (si renseignée), et au moins un critère rempli

#### Scenario: Disclaimer non-contractuel présent
- **WHEN** le PDF est généré
- **THEN** le pied de page contient la mention "Document généré par PatriAlta — non contractuel" sur chaque page

#### Scenario: Date de génération dans l'en-tête
- **WHEN** le PDF est téléchargé
- **THEN** l'en-tête affiche la date de génération au format JJ/MM/AAAA
