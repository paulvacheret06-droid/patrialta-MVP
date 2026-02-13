## Context

T4 a livré le moteur de matching S1 (tables `aides` + `eligibility_results`, moteur déterministe, affichage `/monuments/[id]/aides`). Les fondations sont en place. T5 s'appuie dessus pour :

1. **Compléter S1** : simulateur de financement, mode projet, sync Aides-territoires (Vercel Cron), veille push email (Brevo), export PDF synthèse
2. **Construire S2 de zéro** : tables `dossiers` + `documents` + `alerts`, templates TypeScript, génération Claude API streaming SSE, dashboard dossier, upload pièces (Supabase Storage), export PDF + DOCX

Contraintes héritées de l'architecture :
- Matching S1 reste zéro LLM — Claude API strictement réservé à S2
- `@react-pdf/renderer` exige `runtime = 'nodejs'` (incompatible Edge Runtime Vercel)
- Server Actions pour toute la logique métier S1 (simulateur inclus)
- RLS Supabase natif — pas de middleware applicatif
- `SUPABASE_SERVICE_ROLE_KEY` uniquement pour cron jobs et webhooks internes

---

## Goals / Non-Goals

**Goals :**
- Simulateur de financement sous forme de Server Action pure
- Sync quotidienne Aides-territoires avec diff et validation Zod
- Veille push email (nouvelles aides + deadlines) via Vercel Cron
- Export PDF synthèse aides éligibles
- Mode projet sur le monument (champs optionnels, matching affiné)
- S2 complet : génération Claude streaming SSE, 3 templates initiaux, dashboard, upload pièces, export PDF + DOCX

**Non-Goals :**
- Interface admin pour gérer les aides (Supabase Studio suffit pour le MVP)
- Import en masse des aides hors Aides-territoires (saisie manuelle Studio)
- Chatbot ou assistant conversationnel
- Suivi post-dépôt (statut instruction → accordé/refusé)
- Envoi automatique de dossiers
- Redis pour le rate limiting (Map en mémoire suffit pour le MVP)

---

## Decisions

### D1 — Simulateur de financement : Server Action pure

**Choix** : `calculateSimulation(monumentId, budgetEstime)` est une Server Action qui charge les `eligibility_results` éligibles, applique les règles de cumul (`regles_cumul` JSONB), et retourne un tableau de combinaisons avec montants estimés.

**Pourquoi pas client-side** : l'ARCHITECTURE.md l'impose explicitement. La logique métier des règles de cumul (plafond 80% financement public, incompatibilités) ne doit pas être exposée côté navigateur.

**Structure de retour** :
```typescript
interface SimulationResult {
  combinations: {
    aides: { id: string; nom: string; montant_estime: number; taux: number }[]
    total_estime: number
    taux_couverture: number
    respecte_plafond: boolean
  }[]
  budget_total: number
}
```

---

### D2 — Sync Aides-territoires : polling Vercel Cron + diff

**Choix** : Route Handler `/api/aides/sync` protégée par `Authorization: Bearer ${CRON_SECRET}`, déclenchée par Vercel Cron (1x/jour, 3h). Diff sur `external_id + updated_at` : seules les aides modifiées sont upsertées. Alerte email Brevo à l'admin si la sync échoue.

**Pourquoi pas webhook** : Aides-territoires ne supporte pas les webhooks. Polling quotidien cohérent avec la fréquence de mise à jour des aides patrimoine.

**Validation** : chaque objet reçu de l'API est validé via Zod (`AideTerritorieSchema`) avant transformation et insertion. Un objet invalide est loggé et ignoré (pas de crash de la sync entière).

---

### D3 — Veille push : Cron job séparé

**Choix** : job `send-alerts` séparé de `sync-aides` (1x/jour, 8h). Requête `alerts WHERE statut = 'pending' AND scheduled_for <= now()`, envoi email Brevo en batch (max 100/run), mise à jour `statut = 'sent'`.

**Pourquoi séparé** : responsabilités distinctes (sync données vs notifications utilisateurs). Le découplage permet de rejouer les alertes indépendamment.

**Création des alertes** : déclenchée dans la sync — pour chaque aide nouvelle ou modifiée, requête des monuments avec profil compatible → insertion en `alerts` si aucune alerte pending n'existe déjà.

---

### D4 — Export PDF S1 : Route Handler nodejs

**Choix** : Route Handler `/api/monuments/[id]/export-pdf`, `export const runtime = 'nodejs'`, composant `@react-pdf/renderer`. Vérification JWT + ownership avant génération.

**Format** : synthèse A4 — en-tête monument, tableau des aides éligibles (nom, organisme, montant max, deadline, critères remplis/manquants), pied de page avec date de génération et avertissement non-contractuel.

---

### D5 — Templates S2 : TypeScript statique versionné

**Choix** : fichiers TypeScript dans `/lib/templates/` (ex : `drac.ts`, `aura.ts`, `fdp.ts`). Chaque fichier exporte un objet `Template` avec sections, instructions Claude et liste des pièces requises.

**Pourquoi pas BDD** : les templates évoluent peu et doivent être versionnés avec le code. Le champ `prompt_version` en BDD trace quelle version a été utilisée pour chaque génération.

**3 templates initiaux** :
- `drac` — Subvention DRAC monuments classés et inscrits
- `aura` — Aide région Auvergne-Rhône-Alpes patrimoine
- `fdp` — Fondation du Patrimoine (label + Mission Loto)

---

### D6 — Génération Claude : Route Handler streaming SSE

**Choix** : Route Handler `/api/dossiers/generate`, `runtime = 'nodejs'`, `ReadableStream` avec `Content-Type: text/event-stream`.

**Pourquoi Route Handler et non Server Action** : les Server Actions Next.js ne supportent pas le streaming natif. Un Route Handler avec `ReadableStream` permet l'envoi progressif des chunks SSE.

**Pattern exact** :
1. Vérification JWT Supabase + ownership du `dossier_id`
2. Rate limit en mémoire : `Map<userId, { count: number; resetAt: number }>`, max 10/h
3. Chargement template + monument + eligibility_results (pré-remplissage)
4. Stream Anthropic SDK → `ReadableStream` → SSE events `{ type: 'chunk', content: '...' }`
5. Sauvegarde progressive : à chaque fin de section Claude, upsert `contenu_genere` dans `dossiers`
6. Retry 3× backoff exponentiel sur erreurs 529/500

**Client** : `fetch` avec `ReadableStream` reader (plus fiable qu'`EventSource` pour les streams non-standard).

---

### D7 — Stockage contenu généré : JSONB `ContenuDossier`

**Choix** : JSONB dans `dossiers.contenu_genere` avec type TypeScript `ContenuDossier` (interface déjà définie dans ARCHITECTURE.md).

**Pourquoi pas table sections dédiée** : simplicité MVP, mise à jour atomique, requête unique. Si le contenu dépasse ~500Ko, migrer vers Supabase Storage en V2.

---

### D8 — Supabase Storage : bucket privé + signed URLs

**Choix** : bucket `dossiers-pieces` privé (pas d'URL publique). Upload via Server Action (JWT user), URL d'accès via signed URL expirée (1h).

**Types MIME acceptés** : `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `image/jpeg`, `image/png`. Taille max : 10 Mo par fichier.

**RLS Storage** : politique Supabase Storage avec `auth.uid() = owner`, cohérente avec RLS tables.

---

### D9 — Export dossier : deux formats distincts

**Choix** : Route Handler `/api/dossiers/[id]/export?format=pdf|docx`, `runtime = 'nodejs'`.

- **PDF** : `@react-pdf/renderer` — mise en page officielle, non modifiable, pour envoi
- **DOCX** : bibliothèque `docx` — éditable après export, pour finalisation par le rédacteur

Les deux utilisent les mêmes données `contenu_genere` JSONB — pas de duplication.

---

### D10 — Rate limiting S2 : Map en mémoire

**Choix** : `Map<userId, { count: number; resetAt: number }>` dans le module Route Handler (scope process).

**Pourquoi pas Redis** : surcharge pour le MVP avec peu d'utilisateurs. Limitation connue : ne fonctionne pas en multi-instance Vercel (chaque instance a sa propre Map). Acceptable en MVP, migrer vers Upstash Redis en V2 si nécessaire.

---

## Risks / Trade-offs

**[Rate limit non partagé entre instances Vercel]** → Acceptable pour le MVP (peu d'utilisateurs concurrents). Mitigation V2 : Upstash Redis.

**[Stream Claude interrompu en cours de génération]** → Le contenu partiellement généré est sauvegardé dans `contenu_genere` au fil des chunks. L'utilisateur peut relancer la génération (section vide = rechargée). Le champ `is_complete: false` signale un dossier incomplet.

**[Sync Aides-territoires — changement de schéma API]** → Validation Zod stricte : tout objet non conforme est ignoré et loggé. L'alerte admin Brevo est déclenchée si plus de 20% des objets sont invalides (signe de changement majeur).

**[Templates Claude coûteux en tokens]** → Les 3 templates initiaux sont légers (< 4 sections). Le champ `prompt_version` permet de changer de prompt sans migration BDD. Suivi des coûts via Anthropic dashboard.

**[`contenu_genere` JSONB > 500Ko]** → Improbable pour 3–5 sections. Mitigation V2 : déplacer vers Supabase Storage.

**[Signed URLs Supabase Storage expirées]** → Regénérer la signed URL à l'accès si expirée (pattern standard). Expiration 1h suffit pour l'usage dashboard.

---

## Migration Plan

1. **Migrations SQL** (ordre strict) :
   a. `ALTER TABLE monuments ADD COLUMN` pour les champs mode projet
   b. Création table `alerts` (avec RLS)
   c. Création table `dossiers` (avec RLS)
   d. Création table `documents` (avec RLS)
   e. Création bucket Supabase Storage `dossiers-pieces` + politique privée

2. **Vercel Cron** : ajouter `sync-aides` + `send-alerts` dans `vercel.json` — requiert plan Pro actif

3. **Variables d'environnement** : vérifier que `ANTHROPIC_API_KEY`, `AIDES_TERRITOIRES_API_KEY`, `BREVO_API_KEY`, `CRON_SECRET` sont configurées dans Vercel Dashboard

4. **Rollback** : les migrations sont additives (nouvelles tables, nouveaux champs nullable) → pas de rollback destructif nécessaire. Désactiver les cron jobs dans `vercel.json` suffit à stopper la sync et les alertes.

---

## Open Questions

- **Brevo : template email ou texte plain ?** — Texte plain pour le MVP, template HTML Brevo pour la V2 avec branding PatriAlta
- **Aides-territoires : filtre thématique exact ?** — À confirmer lors de l'implémentation (`theme` ou `category` = `patrimoine`). À valider avec un appel test avant le code final.
- **Nombre de pièces par organisme dans les 3 templates** — À définir lors de l'écriture des templates. Estimation : DRAC ~8 pièces, AuRA ~6, FdP ~5.
