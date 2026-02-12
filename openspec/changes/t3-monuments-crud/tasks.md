## 1. Validation & Types

- [x] 1.1 Créer `lib/validations/monuments.ts` avec schéma Zod (`nom`, `commune`, `departement`, `region` obligatoires ; `ref_merimee`, `type_protection`, `epoque`, `usage_actuel` optionnels) et type `MonumentFormState`
- [x] 1.2 Mettre à jour `actions/monuments.ts` : importer le schéma Zod, valider dans `createMonument`, retourner `MonumentFormState` avec erreurs champ par champ (supprimer le TODO)

## 2. Composant MerimeeSearch

- [x] 2.1 Créer `app/(app)/monuments/_components/MerimeeSearch.tsx` (Client Component) : input texte avec debounce 300 ms, fetch vers `/api/merimee/search` dès ≥ 2 caractères
- [x] 2.2 Afficher la liste déroulante de résultats (nom + commune) ; appeler `onSelect(result)` au clic
- [x] 2.3 Gérer le cas `fallback: true` : masquer la liste, afficher le message "Saisie manuelle disponible" et notifier le parent via prop `onFallback`

## 3. Composant MonumentForm

- [x] 3.1 Créer `app/(app)/monuments/_components/MonumentForm.tsx` (Client Component) avec `useActionState(createMonument, initialState)`
- [x] 3.2 Intégrer `MerimeeSearch` : la sélection d'un résultat pré-remplit les champs (`commune`, `departement`, `region`, `ref_merimee`, `type_protection`) via état local
- [x] 3.3 Ajouter le toggle "Je ne trouve pas mon monument" : bascule en mode manuel (champs libres, `MerimeeSearch` masqué) ; `onFallback` active aussi ce mode automatiquement
- [x] 3.4 Afficher les erreurs Zod sous chaque champ concerné

## 4. Composant MonumentList

- [x] 4.1 Créer `app/(app)/monuments/_components/MonumentList.tsx` : liste les monuments avec nom, commune et badge type de protection
- [x] 4.2 Ajouter bouton "Supprimer" avec confirmation inline (état `pendingDeleteId`) avant d'appeler `deleteMonument`

## 5. Page /monuments

- [x] 5.1 Implémenter `app/(app)/monuments/page.tsx` (RSC) : lire les monuments de l'utilisateur via Supabase server client, composer `MonumentList` + `MonumentForm`
- [x] 5.2 Afficher un état vide avec CTA "Ajouter votre premier monument" si la liste est vide

## 6. Navigation

- [x] 6.1 Ajouter les liens de navigation `/monuments`, `/aides`, `/dossiers` dans le `<header>` de `app/(app)/layout.tsx`

## 7. Tests Playwright

- [x] 7.1 Créer `tests/e2e/monuments.spec.ts` : tester création d'un monument en mode manuel (remplir formulaire + soumettre + vérifier apparition dans la liste)
- [x] 7.2 Tester la suppression d'un monument (cliquer supprimer + confirmer + vérifier disparition)
- [x] 7.3 Tester l'état vide (utilisateur sans monument voit le CTA)
