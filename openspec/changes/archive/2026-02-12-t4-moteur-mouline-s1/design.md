## Context

T3 a livré le CRUD monuments avec autocomplétion Mérimée. Chaque monument stocké en base contient : `protection_type` (classé/inscrit/label/aucun), `statut_juridique` (collectivite/prive/association), `departement`, `region`, `epoque`, `usage_actuel`.

T4 doit faire correspondre ces données à un catalogue d'aides financières structurées pour produire un résultat d'éligibilité factuel. Le matching doit être 100% déterministe et testable sans base de données.

## Goals / Non-Goals

**Goals:**
- Schéma `aides` expressif : chaque aide porte ses propres critères en JSONB, autosuffisant pour le matching
- Moteur de matching pur TypeScript : `matcherAide(monument, aide) → ResultatEligibilite` sans I/O
- Résultats persistés dans `eligibility_results` pour affichage rapide et réutilisation S2
- Page `/monuments/[id]/aides` lisible sans expertise : ✓ / ✗ / ?

**Non-Goals:**
- Sync Aides-territoires (T5+)
- Simulateur de plan de financement (T5+)
- Export PDF des résultats (T5+)
- Veille push / alertes deadline (T6+)
- Mode projet (travaux précisés) (T5+)

## Decisions

### D1 — Critères stockés en JSONB dans `aides` (vs. table relationnelle `aide_criteres`)

`aides.criteres` est un tableau JSONB de `Critere`. Chaque `Critere` porte : `id`, `type` (enum), `valeurs_acceptees`, `obligatoire` (bool), `description_humaine`.

**Pourquoi JSONB plutôt qu'une table séparée ?**
- Le catalogue d'aides est lu en masse (toutes les aides pour un matching), jamais filtré critère par critère en SQL
- Les critères varient qualitativement par aide — une table relationnelle nécessiterait des colonnes nullable ou un EAV
- JSONB permet de changer la structure d'un critère sans migration de schéma
- Coût : pas d'index SQL sur les critères individuels (non nécessaire pour 30–50 aides)

### D2 — Matching exécuté côté serveur via Server Action (vs. client-side ou Edge Function)

La Server Action `runMatching(monumentId)` :
1. Lit le monument depuis Supabase (avec RLS)
2. Lit toutes les aides depuis Supabase (lecture publique)
3. Appelle `matcherAides(monument, aides)` — fonction pure TypeScript
4. Persiste les résultats dans `eligibility_results` (upsert)

**Pourquoi Server Action ?** Cohérent avec les conventions du projet (CRUD monuments, profils). Aucun secret exposé au client. Le matching pur TypeScript reste importable dans les tests unitaires sans dépendance Next.js.

### D3 — Résultats cachés en base (vs. calculés à la volée à chaque page load)

`eligibility_results` stocke les résultats du dernier matching pour chaque paire `(monument_id, aide_id)`.

**Pourquoi cacher ?**
- La page `/monuments/[id]/aides` se charge via `SELECT` simple sans recalcul
- Les résultats seront réutilisés par S2 (pré-remplissage dossiers)
- Invalidation simple : la Server Action `runMatching` fait un `upsert` — toujours déclenché manuellement ou à la modification du monument

**Risque de données périmées :** si le catalogue d'aides est mis à jour, les `eligibility_results` existants deviennent stales. Mitigation T4 : bouton "Recalculer" sur la page. Mitigation T5+ : invalidation automatique sur mise à jour `aides`.

### D4 — Logique de matching : évaluation critère par critère avec trois états

Pour chaque `Critere` d'une aide :
- **rempli** (`✓`) : la valeur du monument est dans `valeurs_acceptees`
- **non rempli** (`✗`) : la valeur du monument est connue mais absente de `valeurs_acceptees`
- **à vérifier** (`?`) : la valeur du monument est `null` / inconnue **ET** le critère est `obligatoire: false`; ou le critère est hors du périmètre actuel de données

Un monument est `est_eligible: true` si tous les critères `obligatoire: true` sont remplis. `est_eligible: null` si au moins un critère est `a_verifier`. `est_eligible: false` si au moins un critère `obligatoire: true` est non rempli.

### D5 — Seed data en TypeScript statique (vs. fichier SQL ou CSV)

`/lib/s1/seed/aides.ts` exporte un tableau `Aide[]`. Un script `scripts/seed-aides.ts` l'insère via le service_role client. Cette approche permet de typer les données et de les réutiliser dans les tests.

## Risks / Trade-offs

- **Données monuments incomplètes** → beaucoup de critères `a_verifier`. Mitigation : encourager l'utilisateur à compléter son profil monument (badge de complétude en T5+)
- **10 aides de seed** → couverture limitée pour les tests métier. Mitigation : choix représentatif des 5 types de sources (État, région, département, fondation privée, Europe)
- **JSONB non validé en base** → un bug dans le seed crée des données malformées silencieusement. Mitigation : validation Zod côté TypeScript avant tout `INSERT`

## Migration Plan

1. Migration SQL : création `aides` + `eligibility_results` + RLS + indexes
2. Script seed : insertion des 10 aides via `scripts/seed-aides.ts`
3. Déploiement du moteur et de la page (pas de migration de données existantes)
4. Rollback : supprimer les tables + retirer les routes (pas d'impact sur T1–T3)

## Open Questions

- Aucune : le périmètre T4 est suffisamment contraint pour démarrer.
