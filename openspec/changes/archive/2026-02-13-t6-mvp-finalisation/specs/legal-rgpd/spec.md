## ADDED Requirements

### Requirement: Pages légales obligatoires

Le système SHALL fournir trois pages légales statiques accessibles sans authentification : `/legal/cgu` (Conditions Générales d'Utilisation), `/legal/mentions-legales` (mentions légales selon loi française), `/legal/confidentialite` (politique de confidentialité RGPD). Ces pages MUST être des Server Components statiques Next.js 15, mises en cache indéfiniment.

#### Scenario: Accès anonyme aux pages légales

- **WHEN** un visiteur non authentifié accède à `/legal/cgu`, `/legal/mentions-legales`, ou `/legal/confidentialite`
- **THEN** la page s'affiche correctement sans redirection vers `/auth/login`

#### Scenario: Contenu minimal CGU

- **WHEN** on inspecte `/legal/cgu`
- **THEN** la page contient au minimum : objet du service, conditions d'utilisation du compte, responsabilités de PatriAlta, limitation de responsabilité sur la qualité des informations, interdiction d'envoi automatique de dossiers, résiliation et suppression de compte

#### Scenario: Contenu minimal mentions légales

- **WHEN** on inspecte `/legal/mentions-legales`
- **THEN** la page contient au minimum : éditeur (raison sociale ou nom + prénom), hébergeur (Vercel Inc.), directeur de publication

#### Scenario: Contenu minimal politique de confidentialité

- **WHEN** on inspecte `/legal/confidentialite`
- **THEN** la page contient au minimum : données collectées et finalités, base légale du traitement, durée de conservation, droits RGPD (accès, rectification, suppression, portabilité), contact DPO ou responsable traitement, hébergement UE (Frankfurt)

---

### Requirement: Consentement RGPD à l'inscription

Le formulaire d'inscription MUST inclure une case à cocher obligatoire libellée "J'ai lu et j'accepte les [CGU] et la [politique de confidentialité]" avec liens cliquables vers les pages légales correspondantes. L'inscription MUST être bloquée si la case n'est pas cochée.

#### Scenario: Inscription sans consentement bloquée

- **WHEN** un utilisateur soumet le formulaire d'inscription sans cocher la case de consentement
- **THEN** le formulaire affiche une erreur de validation et l'inscription est refusée

#### Scenario: Consentement enregistré en base

- **WHEN** un utilisateur soumet le formulaire avec la case cochée
- **THEN** le champ `rgpd_consent_at` dans la table `profiles` est renseigné avec la date et heure UTC de l'inscription

#### Scenario: Liens légaux dans la case de consentement

- **WHEN** l'utilisateur inspecte la case de consentement dans le formulaire
- **THEN** "CGU" renvoie vers `/legal/cgu` et "politique de confidentialité" renvoie vers `/legal/confidentialite`, tous deux s'ouvrant dans un nouvel onglet

---

### Requirement: Migration SQL — champ rgpd_consent_at

Le système SHALL appliquer une migration Supabase `004_add_rgpd_consent.sql` qui ajoute la colonne `rgpd_consent_at timestamptz NULL` à la table `profiles`. La colonne est nullable pour les comptes existants créés avant T6.

#### Scenario: Migration additive sans perte de données

- **WHEN** la migration `004_add_rgpd_consent.sql` est appliquée sur une base contenant des profils existants
- **THEN** tous les profils existants conservent leurs données, avec `rgpd_consent_at = NULL`

#### Scenario: Nouveau profil avec consentement

- **WHEN** un utilisateur s'inscrit après le déploiement de T6
- **THEN** son profil a `rgpd_consent_at` renseigné avec un timestamp valide non null

---

### Requirement: Disclaimer non-contractuel sur les aides

Chaque page affichant des résultats d'éligibilité (`/monuments/[id]/aides`) MUST afficher un disclaimer visible, non masquable, rappelant que PatriAlta fournit un diagnostic indicatif et que la décision finale d'éligibilité appartient à l'organisme financeur. Ce disclaimer MUST mentionner le lien vers les CGU.

#### Scenario: Disclaimer présent sur page aides

- **WHEN** un utilisateur consulte `/monuments/[id]/aides`
- **THEN** un bandeau ou encadré "Diagnostic indicatif — PatriAlta ne garantit pas l'éligibilité finale" est visible sans nécessiter de scroll sur desktop

#### Scenario: Disclaimer sur le dossier généré

- **WHEN** un utilisateur consulte un dossier généré par IA sur `/dossiers/[id]`
- **THEN** le disclaimer existant "Ce dossier a été généré automatiquement. Relisez et validez chaque section avant tout envoi." est bien visible (exigence déjà couverte en T5 — vérification de conformité)
