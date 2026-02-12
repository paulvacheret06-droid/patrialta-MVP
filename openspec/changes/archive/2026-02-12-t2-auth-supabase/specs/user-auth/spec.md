## ADDED Requirements

### Requirement: Inscription email/password
Le système SHALL permettre à un nouvel utilisateur de créer un compte avec une adresse email et un mot de passe. Le mot de passe MUST contenir au minimum 8 caractères. En cas d'email déjà utilisé, le système SHALL afficher un message d'erreur explicite sans révéler l'existence du compte.

#### Scenario: Inscription réussie
- **WHEN** l'utilisateur soumet le formulaire d'inscription avec un email valide, un mot de passe ≥ 8 caractères, et des champs profil renseignés
- **THEN** le système crée le compte dans `auth.users`, insère un enregistrement dans `public.profiles`, et redirige vers `/monuments`

#### Scenario: Email déjà utilisé
- **WHEN** l'utilisateur soumet le formulaire d'inscription avec un email déjà enregistré
- **THEN** le système affiche "Cet email est déjà utilisé." sans redirection

#### Scenario: Mot de passe trop court
- **WHEN** l'utilisateur soumet le formulaire avec un mot de passe de moins de 8 caractères
- **THEN** le système affiche "Le mot de passe doit contenir au moins 8 caractères." sans création de compte

#### Scenario: Email invalide
- **WHEN** l'utilisateur soumet le formulaire avec une adresse email mal formée
- **THEN** le système affiche "Adresse email invalide." sans création de compte

---

### Requirement: Connexion email/password
Le système SHALL permettre à un utilisateur enregistré de se connecter avec son email et son mot de passe. En cas d'échec, le système SHALL afficher un message générique sans préciser si c'est l'email ou le mot de passe qui est incorrect.

#### Scenario: Connexion réussie sans redirect param
- **WHEN** l'utilisateur soumet le formulaire de connexion avec des identifiants valides et sans paramètre `redirect`
- **THEN** le système établit la session SSR et redirige vers `/monuments`

#### Scenario: Connexion réussie avec redirect param
- **WHEN** l'utilisateur soumet le formulaire de connexion avec des identifiants valides et un paramètre `?redirect=/aides`
- **THEN** le système établit la session SSR et redirige vers `/aides`

#### Scenario: Identifiants incorrects
- **WHEN** l'utilisateur soumet le formulaire de connexion avec un email ou mot de passe incorrect
- **THEN** le système affiche "Email ou mot de passe incorrect." sans redirection

---

### Requirement: Déconnexion
Le système SHALL permettre à un utilisateur connecté de se déconnecter depuis n'importe quelle page de l'application.

#### Scenario: Déconnexion réussie
- **WHEN** l'utilisateur clique sur le bouton de déconnexion dans le layout app
- **THEN** le système invalide la session Supabase, supprime les cookies d'authentification, et redirige vers `/login`

---

### Requirement: Session SSR rafraîchie
Le middleware SHALL rafraîchir automatiquement le token de session Supabase à chaque requête entrante afin que les Server Components reçoivent toujours une session à jour.

#### Scenario: Token expiré rafraîchi automatiquement
- **WHEN** une requête arrive avec un token de session expiré mais un refresh token valide
- **THEN** le middleware renouvelle le token et transmet la session valide à la requête

#### Scenario: Session absente sur route publique
- **WHEN** une requête sans session arrive sur `/login` ou `/signup`
- **THEN** le middleware laisse passer la requête sans redirection

---

### Requirement: Protection des routes applicatives
Le middleware SHALL intercepter toute requête vers les routes `/monuments`, `/aides`, `/dossiers` et rediriger vers `/login` si aucune session valide n'est présente. Le paramètre `?redirect=` SHALL conserver la destination originale.

#### Scenario: Accès non authentifié à une route protégée
- **WHEN** un utilisateur non connecté tente d'accéder à `/monuments`
- **THEN** le middleware redirige vers `/login?redirect=/monuments`

#### Scenario: Accès authentifié à une route protégée
- **WHEN** un utilisateur connecté accède à `/monuments`
- **THEN** la requête est transmise normalement sans redirection

---

### Requirement: Redirection depuis les pages auth si déjà connecté
Le layout des pages auth (`/login`, `/signup`) SHALL rediriger vers `/monuments` si l'utilisateur possède déjà une session valide.

#### Scenario: Utilisateur connecté sur /login
- **WHEN** un utilisateur déjà authentifié visite `/login`
- **THEN** il est redirigé vers `/monuments`
