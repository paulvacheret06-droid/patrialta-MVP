## 1. Migration SQL — champ rgpd_consent_at

- [x] 1.1 Créer `supabase/migrations/004_add_rgpd_consent.sql` — ALTER TABLE `profiles` ADD COLUMN `rgpd_consent_at timestamptz NULL` ; appliquer via Supabase Dashboard SQL Editor

## 2. Catalogue aides enrichi

- [x] 2.1 Créer `/lib/s1/seed/aides-enrichies.ts` — partie 1 : 10 aides État/DRAC (subvention MH classé, subvention MH inscrit, Fonds Incitatif et Qualitatif, FSIL patrimoine, fonds d'urgence péril) avec critères `protection_type`, `statut_juridique`, `region: []` (national), règles de cumul plafond 80%
- [x] 2.2 Créer `/lib/s1/seed/aides-enrichies.ts` — partie 2 : 8 aides régions AuRA (aide patrimoine bâti Conseil Régional AuRA, patrimoine rural AuRA, heritage AURA, etc.) et Grand Est (aide patrimoine non protégé Grand Est, fonds régional patrimoine) avec critères `region` appropriés
- [x] 2.3 Créer `/lib/s1/seed/aides-enrichies.ts` — partie 3 : 5 aides départementales (Rhône, Ain, Aube) avec critères `departement` correspondants
- [x] 2.4 Créer `/lib/s1/seed/aides-enrichies.ts` — partie 4 : 8 aides fondations privées (Fondation du Patrimoine label, Fondation du Patrimoine souscription, Fondation du Patrimoine Mission Patrimoine Loto, VMF, Sauvegarde de l'Art Français, Fondation de France, Fondation Total Énergies Nouvelles, Fondation Cartier pour l'art contemporain si applicable) avec critères `statut_juridique`
- [x] 2.5 Créer `/lib/s1/seed/aides-enrichies.ts` — partie 5 : 2 aides européennes (FEDER volet patrimoine, programme LEADER) avec critères géographiques
- [x] 2.6 Créer `scripts/seed-aides-full.ts` — importer `aides-enrichies.ts`, valider chaque aide avec le schema Zod existant (`AideSchema` dans `/lib/validations/`), upsert via `service_role` sur `slug`, afficher rapport (insérées / mises à jour / ignorées)
- [x] 2.7 Exécuter `npx tsx scripts/seed-aides-full.ts` et vérifier dans Supabase Dashboard que ≥ 30 aides sont présentes avec données correctes

## 3. Migration schema — champ rgpd_consent_at dans les types TypeScript

- [x] 3.1 Mettre à jour `/lib/types/profile.ts` (ou équivalent) — ajouter `rgpd_consent_at: string | null` dans le type `Profile` TypeScript

## 4. Landing page — `/app/page.tsx`

- [x] 4.1 Réécrire `/app/page.tsx` en Server Component — afficher la landing page si non authentifié (propositions de valeur, CTA) ou rediriger vers `/monuments` si authentifié (via `createServerClient` + `getUser()`)
- [x] 4.2 Créer `/components/landing/Hero.tsx` — headline "De votre monument à votre dossier de subvention", sous-titre, CTA "Commencer gratuitement" → `/auth/signup`, composant Server Component (pas d'interactivité client nécessaire)
- [x] 4.3 Créer `/components/landing/ValuePillars.tsx` — 4 piliers (exhaustivité, proactivité, accessibilité, continuité S1→S2) avec icône, titre et description courte, grille 2×2 responsive

## 5. État vide — premier monument

- [x] 5.1 Modifier `/app/monuments/page.tsx` — détecter si `monuments.length === 0` et afficher `/components/monuments/EmptyState.tsx` à la place de la liste
- [x] 5.2 Créer `/components/monuments/EmptyState.tsx` — icône monument, titre "Vous n'avez pas encore de monument", description bénéfice ("Ajoutez votre premier monument pour découvrir les aides auxquelles vous êtes éligible"), CTA "Ajouter mon premier monument" → formulaire d'ajout

## 6. Footer global

- [x] 6.1 Créer `/components/layout/Footer.tsx` — nom PatriAlta, liens `/legal/cgu`, `/legal/mentions-legales`, `/legal/confidentialite`, année dynamique (`new Date().getFullYear()`)
- [x] 6.2 Intégrer `Footer` dans `/app/layout.tsx` — juste avant la fermeture du `<body>`, en dehors des layouts authentifiés si nécessaire

## 7. Pages légales

- [x] 7.1 Créer `/app/legal/cgu/page.tsx` — Server Component statique, contenu complet CGU PatriAlta (objet du service, compte, responsabilités, limitation de responsabilité, résiliation)
- [x] 7.2 Créer `/app/legal/mentions-legales/page.tsx` — Server Component statique, contenu : éditeur (Paul Vacheret ou raison sociale), hébergeur (Vercel Inc. San Francisco), directeur de publication
- [x] 7.3 Créer `/app/legal/confidentialite/page.tsx` — Server Component statique, contenu complet politique de confidentialité RGPD (données collectées, finalités, base légale, durée de conservation, droits utilisateurs, contact, hébergement UE Frankfurt)
- [x] 7.4 Créer `/app/legal/layout.tsx` — layout minimaliste pour les pages légales avec en-tête simple (retour vers `/`) et centrage du contenu

## 8. Consentement RGPD à l'inscription

- [x] 8.1 Modifier le formulaire d'inscription (composant signup) — ajouter une case à cocher `rgpd_accepted` obligatoire avec libellé "J'ai lu et j'accepte les [CGU](/legal/cgu) et la [politique de confidentialité](/legal/confidentialite)" (liens ouverts dans `target="_blank"`)
- [x] 8.2 Modifier la Server Action ou Route Handler d'inscription — valider que `rgpd_accepted === true` (erreur 400 sinon), enregistrer `rgpd_consent_at = new Date().toISOString()` lors de la création du profil dans `profiles`

## 9. Disclaimer non-contractuel sur la page aides

- [x] 9.1 Ajouter un composant disclaimer dans `/app/monuments/[id]/aides/page.tsx` (ou dans le composant `AidesPage`) — bandeau "Diagnostic indicatif — PatriAlta ne garantit pas l'éligibilité finale. [Voir nos CGU](/legal/cgu).", style non masquable (pas de bouton fermer)

## 10. Tests E2E Playwright

- [x] 10.1 Écrire `tests/e2e/landing.spec.ts` — vérifier : landing accessible sans auth, CTA présent, redirection vers `/monuments` si connecté, rendu responsive 375px et 1280px
- [x] 10.2 Écrire `tests/e2e/onboarding.spec.ts` — vérifier : état vide affiché si aucun monument, CTA "Ajouter mon premier monument" fonctionnel, footer présent avec 3 liens légaux
- [x] 10.3 Écrire `tests/e2e/legal.spec.ts` — vérifier : pages `/legal/cgu`, `/legal/mentions-legales`, `/legal/confidentialite` accessibles sans auth, contenu non vide, footer présent
- [x] 10.4 Vérifier rendu responsive de la landing sur mobile (375px) et desktop (1280px) via Playwright
