## 1. Interfaces et types TypeScript

- [x] 1.1 Dans `/lib/types/s2.ts` — définir `ContenuDossier`, `SectionDossier`, `Template`, `TemplateSectionDef`, `SimulationResult`, `SimulationCombination`
- [x] 1.2 Dans `/lib/types/s2.ts` — définir `DossierStatut` (union `'brouillon' | 'en_cours' | 'finalise'`), `DocumentStatut`, `AlertType`, `AlertStatut`
- [x] 1.3 Dans `/lib/validations/aides-territoires.ts` — créer le schema Zod `AideTerritorieSchema` couvrant les champs retournés par l'API Aides-territoires

## 2. Migrations SQL

- [x] 2.1 Écrire `supabase/migrations/YYYYMMDD_alter_monuments_mode_projet.sql` — déjà inclus dans `001_initial_schema.sql` (champs description_projet, type_travaux, budget_estime)
- [x] 2.2 Écrire `supabase/migrations/YYYYMMDD_create_alerts.sql` — déjà dans `001_initial_schema.sql`
- [x] 2.3 Écrire `supabase/migrations/YYYYMMDD_create_dossiers.sql` — déjà dans `001_initial_schema.sql`
- [x] 2.4 Écrire `supabase/migrations/YYYYMMDD_create_documents.sql` — déjà dans `001_initial_schema.sql`
- [x] 2.5 Appliquer les 4 migrations via Supabase Dashboard et vérifier tables + policies dans l'interface
- [x] 2.6 Créer le bucket Supabase Storage `dossiers-pieces` en mode privé (pas d'accès public) via Supabase Dashboard, configurer la policy d'accès (authenticated uniquement, owner = auth.uid())

## 3. S1 — Mode projet

- [x] 3.1 Créer la Server Action `updateMonumentProjet(monumentId, data)` dans `/lib/actions/monuments.ts` — validation Zod des champs (`type_travaux` enum array, `budget_estime` positif), vérification ownership, upsert dans `monuments`
- [x] 3.2 Créer le composant `/components/monuments/ModeProjetForm.tsx` — formulaire avec textarea `description_projet`, checkboxes multi-sélection `type_travaux` (6 catégories), champ numérique `budget_estime`, bouton Enregistrer
- [x] 3.3 Intégrer `ModeProjetForm` dans la page de détail ou d'édition du monument (`/app/monuments/[id]/edit/page.tsx` ou équivalent)
- [x] 3.4 Mettre à jour `runMatching` dans `/lib/actions/matching.ts` pour filtrer les aides par `type_travaux_eligible` si le monument a des `type_travaux` renseignés
- [x] 3.5 Mettre à jour `/components/monuments/MonumentCard.tsx` — ajouter un badge "Mode projet" si `type_travaux` non vide ou `budget_estime` renseigné
- [x] 3.6 Mettre à jour la page `/monuments/[id]/aides` — afficher un indicateur "Mode projet actif" avec les types de travaux si les champs sont renseignés

## 4. S1 — Simulateur de financement

- [x] 4.1 Créer la Server Action `calculateSimulation(monumentId, budgetEstime)` dans `/lib/actions/simulation.ts` — charger les aides éligibles depuis `eligibility_results`, appliquer les règles de cumul `regles_cumul` JSONB, calculer montants et taux, retourner `SimulationResult`
- [x] 4.2 Écrire des tests unitaires dans `__tests__/s1/simulation.test.ts` — 3 cas minimum : aide simple, cumul avec plafond 80%, monument sans aides éligibles
- [x] 4.3 Créer le composant `/components/s1/SimulateurFinancement.tsx` — champ budget (Client Component), appel Server Action au submit, affichage des combinaisons, badge plafond dépassé
- [x] 4.4 Intégrer `SimulateurFinancement` dans `/app/monuments/[id]/aides/page.tsx` — visible uniquement si au moins une aide éligible

## 5. S1 — Export PDF synthèse

- [x] 5.1 Créer le composant React-PDF `/components/pdf/AidesSyntheseDocument.tsx` — en-tête monument, tableau des aides éligibles (nom, organisme, montant max, deadline, critères remplis), pied de page avec date et disclaimer non-contractuel
- [x] 5.2 Créer le Route Handler `/app/api/monuments/[id]/export-pdf/route.ts` — `export const runtime = 'nodejs'`, vérification JWT + ownership, génération PDF via `@react-pdf/renderer`, retour `application/pdf` avec `Content-Disposition: attachment`
- [x] 5.3 Ajouter le bouton "Exporter PDF" dans `/components/s1/AidesPage.tsx` (ou équivalent) — visible uniquement si au moins une aide éligible, indicateur de chargement pendant la génération

## 6. S2 — Templates par organisme

- [x] 6.1 Créer `/lib/templates/index.ts` — exporter la fonction `getTemplate(organismeId: string): Template` avec fallback template générique
- [x] 6.2 Créer `/lib/templates/drac.ts` — template DRAC : 5 sections (présentation monument, description travaux, plan de financement, pièces justificatives, engagement du propriétaire), liste des pièces (~8), `prompt_version = 'drac-v1.0'`
- [x] 6.3 Créer `/lib/templates/aura.ts` — template Région AuRA : 4 sections (contexte patrimonial, projet de restauration, budget et cofinancements, impact territorial), liste des pièces (~6), `prompt_version = 'aura-v1.0'`
- [x] 6.4 Créer `/lib/templates/fdp.ts` — template Fondation du Patrimoine : 4 sections (présentation du bien, intérêt patrimonial, projet et planning, plan de financement), liste des pièces (~5), `prompt_version = 'fdp-v1.0'`

## 7. S2 — Création et génération de dossier

- [x] 7.1 Créer la Server Action `createDossier(monumentId, aideId)` dans `/lib/actions/dossiers.ts` — vérifier éligibilité dans `eligibility_results`, vérifier doublon, insérer `dossier` avec `statut = 'brouillon'`, retourner l'id du dossier
- [x] 7.2 Créer le module de rate limiting `/lib/s2/rate-limit.ts` — `Map<string, { count: number; resetAt: number }>`, fonction `checkRateLimit(userId): { allowed: boolean; resetAt?: Date }`
- [x] 7.3 Créer la fonction de build de prompt `/lib/s2/prompt-builder.ts` — assemble template + données monument + eligibility_results + profil propriétaire en un prompt structuré, applique la minimisation RGPD (pas de données personnelles directement identifiantes)
- [x] 7.4 Créer le Route Handler `/app/api/dossiers/generate/route.ts` — `export const runtime = 'nodejs'`, vérification JWT + ownership, rate limit, stream Anthropic SDK → SSE, sauvegarde progressive `contenu_genere`, retry 3× backoff exponentiel sur 529/500
- [x] 7.5 Créer le hook client `/hooks/useDossierGeneration.ts` — `fetch` avec ReadableStream reader, parsing des events SSE, state `isGenerating`, `content`, `error`
- [x] 7.6 Ajouter le CTA "Démarrer un dossier" dans `/components/s1/AideCard.tsx` — visible uniquement pour les aides avec `est_eligible: true`, appelle `createDossier` puis redirige vers `/dossiers/[id]`

## 8. S2 — Dashboard dossier

- [x] 8.1 Créer la page Server Component `/app/dossiers/[id]/page.tsx` — charger dossier + monument + aide + documents depuis Supabase, vérifier ownership (404 si tiers), passer données aux composants client
- [x] 8.2 Créer `/components/s2/SectionEditor.tsx` — textarea éditable avec auto-save, indicateur "modifiée manuellement" si `is_edite: true`, appel Server Action `updateDossierSection` au blur
- [x] 8.3 Créer la Server Action `updateDossierSection(dossierId, sectionId, contenu)` dans `/lib/actions/dossiers.ts` — vérification ownership, mise à jour partielle du JSONB `contenu_genere`, `is_edite: true`
- [x] 8.4 Créer `/components/s2/DossierProgressBar.tsx` — calculer progression (sections renseignées / pièces obligatoires uploadées), afficher pourcentage et messages contextuels
- [x] 8.5 Créer `/components/s2/GenerationButton.tsx` — bouton "Générer le dossier", utilise `useDossierGeneration`, affiche sections en temps réel au fil du streaming
- [x] 8.6 Créer `/components/s2/DossierDisclaimer.tsx` — bandeau permanent non masquable "Ce dossier a été généré automatiquement. Relisez et validez chaque section avant tout envoi."
- [x] 8.7 Créer la Server Action `finalizeDossier(dossierId)` — vérifier sections non vides + pièces obligatoires uploadées, passer `statut` à `'finalise'`

## 9. S2 — Upload pièces justificatives

- [x] 9.1 Créer la Server Action `uploadDocument(dossierId, file, typePiece)` dans `/lib/actions/documents.ts` — vérification ownership, validation type MIME (PDF/DOCX/JPEG/PNG) et taille (≤ 10 Mo), upload Supabase Storage vers `[user_id]/[dossier_id]/[type_piece]/[filename]`, insertion dans `documents`
- [x] 9.2 Créer la Server Action `deleteDocument(documentId)` — vérification ownership via RLS, suppression fichier Supabase Storage + ligne `documents`
- [x] 9.3 Créer la Server Action `getDocumentSignedUrl(documentId)` — vérification ownership, génération signed URL Supabase Storage avec expiration 1h
- [x] 9.4 Créer `/components/s2/ChecklistPieces.tsx` — liste des pièces requises depuis le template, statut par pièce (manquant/uploade/valide), bouton "Uploader" par pièce, intégration avec `uploadDocument`
- [x] 9.5 Créer `/components/s2/DocumentUploader.tsx` — input file avec validation MIME et taille côté client, feedback upload en cours, affichage erreur

## 10. S2 — Export dossier PDF et DOCX

- [x] 10.1 Créer le composant React-PDF `/components/pdf/DossierDocument.tsx` — page de garde (monument, aide, organisme, date), sections dans l'ordre du template, pied de page avec disclaimer validation humaine, annexe pièces justificatives
- [x] 10.2 Créer la fonction `/lib/s2/export-docx.ts` — `generateDossierDocx(dossier, monument, aide, template): Buffer` utilisant la bibliothèque `docx`, même structure que le PDF
- [x] 10.3 Créer le Route Handler `/app/api/dossiers/[id]/export/route.ts` — `export const runtime = 'nodejs'`, paramètre `?format=pdf|docx`, vérification JWT + ownership, génération et retour avec headers `Content-Disposition: attachment` appropriés
- [x] 10.4 Ajouter les boutons "Exporter PDF" et "Exporter Word" dans le dashboard dossier, visibles uniquement après le disclaimer, avec indicateurs de chargement

## 11. Sync Aides-territoires

- [x] 11.1 Créer le service `/lib/aides-territoires/client.ts` — fonction `fetchAidesPatrimoine(): Promise<AideTerritorie[]>` utilisant `AIDES_TERRITOIRES_API_KEY`, avec pagination si nécessaire
- [x] 11.2 Créer le service `/lib/aides-territoires/transformer.ts` — fonction `transformAideTerritorie(raw): Partial<Aide>` qui mappe les champs Aides-territoires vers le schéma `aides` de PatriAlta
- [x] 11.3 Créer le service `/lib/aides-territoires/sync.ts` — logique diff complète : `upsertAides(aides)` avec `service_role`, `markInactiveAides(activeExternalIds)`, compteurs insert/update/skip, alerte Brevo si >20% invalides
- [x] 11.4 Créer le Route Handler `/app/api/aides/sync/route.ts` — vérification `CRON_SECRET`, appel orchestré des services client + transformer + sync, gestion erreur globale avec alerte email Brevo, retour rapport JSON
- [x] 11.5 Ajouter `sync-aides` dans `vercel.json` — déjà configuré dans `vercel.json`
- [x] 11.6 Tester manuellement la route `/api/aides/sync` en local avec le header `Authorization: Bearer <CRON_SECRET>` et vérifier les aides dans Supabase

## 12. Veille push

- [x] 12.1 Créer le service `/lib/alerts/create-alerts.ts` — `createAlertsForNewAides(newAideIds: string[])` : pour chaque aide, trouver les monuments avec profil compatible (géographie + type_monument + statut_juridique), insérer alertes `nouvelle_aide` si pas de doublon pending
- [x] 12.2 Créer le service `/lib/alerts/create-deadline-alerts.ts` — `createDeadlineAlerts()` : requêter les aides avec `date_depot_fin` dans les 30 jours, croiser avec monuments éligibles, insérer alertes `deadline_approche` sans doublons
- [x] 12.3 Créer le service `/lib/alerts/send-alerts.ts` — `sendPendingAlerts()` : récupérer alerts pending (max 100, `scheduled_for <= now()`), grouper par `user_id`, composer et envoyer emails Brevo, marquer `statut = 'sent'`
- [x] 12.4 Créer le Route Handler `/app/api/alerts/send/route.ts` — vérification `CRON_SECRET`, appel `createDeadlineAlerts()` + `sendPendingAlerts()`, retour rapport
- [x] 12.5 Ajouter `send-alerts` dans `vercel.json` — déjà configuré dans `vercel.json`
- [x] 12.6 Créer la Server Action `dismissAlert(alertId)` dans `/lib/actions/alerts.ts` — vérification ownership via RLS, mise à jour `statut = 'dismissed'`
- [x] 12.7 Créer un composant `/components/alerts/AlertsBanner.tsx` — affichage des alertes `pending` de l'utilisateur sur le dashboard ou la page monuments, bouton "Masquer"

## 13. Tests E2E Playwright

- [x] 13.1 Écrire `tests/e2e/dossier-generation.spec.ts` — flow complet : connexion → liste monuments → clic "Voir les aides éligibles" → clic "Démarrer un dossier" → page dossier → clic "Générer" → vérifier affichage du contenu généré en streaming
- [x] 13.2 Écrire `tests/e2e/dossier-export.spec.ts` — flow export : dossier généré → clic "Exporter PDF" → vérifier déclenchement du téléchargement → clic "Exporter Word" → vérifier déclenchement
- [x] 13.3 Écrire `tests/e2e/simulateur.spec.ts` — flow simulateur : page aides → saisir budget → clic "Simuler" → vérifier affichage des combinaisons d'aides avec montants
- [x] 13.4 Vérifier le rendu responsive de `/dossiers/[id]` sur mobile (375px) et desktop (1280px) via Playwright
- [x] 13.5 Vérifier le rendu responsive de `/monuments/[id]/aides` avec le simulateur et les nouveaux CTAs sur mobile (375px) et desktop (1280px)
