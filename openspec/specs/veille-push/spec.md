## ADDED Requirements

### Requirement: Création automatique des alertes lors de la sync
Lors de chaque sync Aides-territoires, le système SHALL comparer les aides nouvelles ou réactivées avec les profils de monuments sauvegardés. Pour chaque paire (monument, aide) où le matching est positif et où aucune alerte `pending` n'existe déjà, une alerte de type `nouvelle_aide` DOIT être insérée dans la table `alerts` avec `scheduled_for = now()`. Le système MUST également créer des alertes `deadline_approche` pour les aides éligibles dont `date_depot_fin` est dans les 30 jours et pour lesquelles aucune alerte pending n'existe.

#### Scenario: Nouvelle aide correspondant à un monument sauvegardé
- **WHEN** la sync détecte une aide nouvelle ou réactivée qui matche le profil d'un monument
- **THEN** une alerte `nouvelle_aide` est insérée dans `alerts` pour le couple (user_id, monument_id, aide_id)

#### Scenario: Deadline approchante — 30 jours
- **WHEN** une aide éligible a `date_depot_fin` dans les 30 prochains jours
- **THEN** une alerte `deadline_approche` est insérée pour le couple (user_id, monument_id, aide_id) si aucune alerte `pending` n'existe déjà

#### Scenario: Alerte déjà existante — pas de doublon
- **WHEN** une alerte `pending` de même type, monument_id et aide_id existe déjà
- **THEN** aucune nouvelle alerte n'est créée (idempotence)

---

### Requirement: Envoi des alertes email via Vercel Cron
Le système SHALL exécuter un job `send-alerts` quotidien (Vercel Cron, `0 8 * * *`) qui récupère toutes les alertes avec `statut = 'pending'` et `scheduled_for <= now()`, envoie un email Brevo par utilisateur (batch — une email par user regroupant toutes ses alertes du jour), et marque les alertes envoyées avec `statut = 'sent'` et `sent_at = now()`. Le job MUST être protégé par `CRON_SECRET`.

#### Scenario: Alertes pending disponibles — envoi email
- **WHEN** le job `send-alerts` s'exécute et trouve des alertes pending dont `scheduled_for <= now()`
- **THEN** un email est envoyé à chaque utilisateur concerné regroupant toutes ses alertes du jour, et les alertes sont marquées `sent`

#### Scenario: Aucune alerte pending
- **WHEN** le job `send-alerts` s'exécute et ne trouve aucune alerte pending
- **THEN** aucun email n'est envoyé et le job se termine avec HTTP 200

#### Scenario: Limite de batch — max 100 alertes par run
- **WHEN** le nombre d'alertes pending dépasse 100
- **THEN** seules les 100 premières sont traitées (ordre `scheduled_for ASC`), les suivantes restent pending pour le prochain run

---

### Requirement: Contenu de l'email d'alerte
L'email d'alerte Brevo SHALL contenir pour chaque alerte : le nom du monument concerné, le type d'alerte (nouvelle aide / deadline approchante), le nom de l'aide, et pour les deadlines, la date limite de dépôt. L'email DOIT inclure un lien direct vers `/monuments/[id]/aides`. L'expéditeur MUST être l'adresse email configurée pour PatriAlta.

#### Scenario: Email de type nouvelle_aide
- **WHEN** un email d'alerte contient des alertes `nouvelle_aide`
- **THEN** chaque alerte est présentée avec le nom de l'aide et un lien vers la page aides du monument

#### Scenario: Email de type deadline_approche
- **WHEN** un email d'alerte contient des alertes `deadline_approche`
- **THEN** chaque alerte affiche la date limite de dépôt et le nombre de jours restants

---

### Requirement: Marquage manuel d'une alerte comme lue
Le système SHALL permettre à l'utilisateur de marquer une alerte comme `dismissed` depuis l'interface (bouton "Masquer" ou équivalent). La mise à jour MUST être effectuée via une Server Action avec vérification de l'ownership via RLS.

#### Scenario: Dismiss d'une alerte
- **WHEN** l'utilisateur clique "Masquer" sur une alerte dans l'interface
- **THEN** le statut de l'alerte passe à `dismissed` et elle disparaît de la liste des alertes actives

#### Scenario: Tentative de dismiss d'une alerte tierce
- **WHEN** un utilisateur tente de dismiss une alerte appartenant à un autre utilisateur
- **THEN** la Server Action retourne une erreur d'autorisation sans modifier l'alerte
