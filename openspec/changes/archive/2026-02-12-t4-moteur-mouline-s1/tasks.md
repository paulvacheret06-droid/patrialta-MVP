## 1. Types et interfaces TypeScript

- [x] 1.1 Créer `/lib/types/s1.ts` — définir `CritereType` (union string), `Critere`, `CritereResult`, `Aide`, `ReglesCumul`, `ResultatEligibilite`
- [x] 1.2 Créer `/lib/validations/aide.ts` — schema Zod `AideSchema` couvrant tous les champs de `Aide` y compris le tableau `criteres` et l'objet `regles_cumul`

## 2. Migration SQL — table aides

- [x] 2.1 Écrire la migration `supabase/migrations/YYYYMMDD_create_aides.sql` : table `aides` avec toutes les colonnes (cf. design D1), contrainte `CHECK` sur `categorie` (6 valeurs), index unique sur `slug`
- [x] 2.2 Ajouter les policies RLS dans la migration : `SELECT` pour `anon` et `authenticated`, `INSERT/UPDATE/DELETE` bloqués pour tous sauf `service_role`
- [x] 2.3 Appliquer la migration via le tableau de bord Supabase et vérifier que la table est visible avec les bonnes colonnes

## 3. Migration SQL — table eligibility_results

- [x] 3.1 Écrire la migration `supabase/migrations/YYYYMMDD_create_eligibility_results.sql` : table `eligibility_results`, FK vers `monuments` (ON DELETE CASCADE) et `aides`, contrainte `UNIQUE(monument_id, aide_id)`
- [x] 3.2 Ajouter les policies RLS : `SELECT/INSERT/UPDATE/DELETE` limités à `auth.uid() = user_id`
- [x] 3.3 Appliquer la migration et vérifier les policies dans Supabase Dashboard

## 4. Seed data — 10 aides représentatives

- [x] 4.1 Créer `/lib/s1/seed/aides.ts` — exporter un tableau `Aide[]` de 10 aides : 3 DRAC (subvention MH classés, MH inscrits, FSIL patrimoine), 2 région AuRA, 2 Fondation du Patrimoine (label + Mission Loto), 2 fondations privées (VMF + Sauvegarde Art Français), 1 FEDER
- [x] 4.2 Créer `scripts/seed-aides.ts` — lire `/lib/s1/seed/aides.ts`, valider chaque aide avec `AideSchema`, insérer via upsert sur `slug` avec le client `service_role`
- [ ] 4.3 Exécuter `npx tsx scripts/seed-aides.ts` et vérifier que 10 lignes sont présentes dans `aides`

## 5. Moteur de matching — logique pure TypeScript

- [x] 5.1 Créer `/lib/s1/matching.ts` — implémenter `matcherAide(monument: Monument, aide: Aide): ResultatEligibilite` : itérer sur `aide.criteres`, classer chaque critère en rempli / non_rempli / a_verifier selon les règles de D4, calculer `est_eligible`
- [x] 5.2 Ajouter `matcherAides(monument: Monument, aides: Aide[]): ResultatEligibilite[]` — map sur le tableau d'aides
- [ ] 5.3 Écrire des tests unitaires dans `__tests__/s1/matching.test.ts` : au moins 4 cas (critère rempli, non rempli, valeur null + obligatoire: false, tous critères remplis → est_eligible true)

## 6. Server Action — runMatching

- [x] 6.1 Créer `/lib/actions/matching.ts` — Server Action `runMatching(monumentId: string)` : vérifier ownership via RLS, lire le monument, lire toutes les aides, appeler `matcherAides`, upsert dans `eligibility_results`, retourner les résultats
- [ ] 6.2 Tester manuellement : appeler `runMatching` depuis la console sur un monument existant, vérifier les lignes dans `eligibility_results`

## 7. Page d'affichage des aides éligibles

- [x] 7.1 Créer `/app/monuments/[id]/aides/page.tsx` — Server Component : charger les `eligibility_results` existants (ou déclencher `runMatching` si vide), passer les données aux composants client
- [x] 7.2 Créer `/components/s1/AideCard.tsx` — carte d'une aide : nom, organisme, catégorie, badge statut (✓ vert / ✗ rouge / ? orange), liste des critères avec icônes, lien source officielle
- [x] 7.3 Créer `/components/s1/CategoryFilter.tsx` — filtres par catégorie sous forme de boutons/onglets, synchronisés avec le paramètre URL `?categorie=`
- [x] 7.4 Créer `/components/s1/RecalcButton.tsx` — bouton "Recalculer" Client Component, appelle `runMatching` via Server Action, affiche un spinner pendant le calcul, revalide les données au retour

## 8. Mise à jour liste monuments

- [x] 8.1 Dans `/app/monuments/page.tsx` (ou le composant de carte monument), ajouter un bouton/lien "Voir les aides éligibles" pointant vers `/monuments/[id]/aides` pour chaque monument listé

## 9. Tests E2E Playwright

- [x] 9.1 Écrire `tests/e2e/eligibility.spec.ts` : flow complet — connexion → liste monuments → clic "Voir les aides éligibles" → vérifier affichage de la page avec au moins une aide → clic "Recalculer" → vérifier rafraîchissement des résultats
- [x] 9.2 Vérifier le rendu responsive de la page `/monuments/[id]/aides` sur mobile (375px) et desktop (1280px)
