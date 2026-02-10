# PatriAlta — Spécification MVP Complète

## 1. Vision du projet

PatriAlta est une plateforme SaaS de gestion du patrimoine historique qui aide les collectivités locales et les propriétaires privés de monuments historiques à identifier les aides financières auxquelles ils sont éligibles et à monter leurs dossiers de subvention.

**Proposition de valeur en une phrase** : PatriAlta est le premier outil qui permet à une commune sans expertise patrimoine de passer de "j'ai un monument" à "j'ai un dossier de subvention prêt" sans consultant.

### Proposition de valeur différenciante (4 piliers)

1. **Exhaustivité transversale** — Personne aujourd'hui ne croise en un seul endroit les aides État + région + département + fondations privées + Europe pour un monument donné. L'ABF connaît la DRAC, pas forcément l'aide spécifique du conseil départemental ou la Fondation Sauvegarde de l'Art Français. PatriAlta agrège tout.

2. **Proactivité (push)** — PatriAlta inverse la logique habituelle. Au lieu que la commune cherche des aides quand elle a un projet, PatriAlta alerte : "une aide vient d'ouvrir pour votre église, vous avez jusqu'au 15 mars." Ça transforme des opportunités ratées en projets déclenchés.

3. **Accessibilité sans expertise** — Un secrétaire de mairie qui gère tout (état civil, urbanisme, cantine, patrimoine) n'a ni le temps ni la compétence pour naviguer dans le mille-feuille des aides. PatriAlta traduit la complexité en critères factuels clairs.

4. **Continuité diagnostic → montage** — L'utilisateur ne repart pas avec une liste pour se débrouiller : il enchaîne directement sur le montage du dossier avec les données déjà pré-remplies.

---

## 2. Cible utilisateurs

### Segments visés pour le test MVP

| Segment | Taille commune | Utilisateur-type | Niveau d'expertise |
|---|---|---|---|
| Grosses communes | 15 000 – 50 000 hab | Adjoint à la culture / responsable patrimoine | Moyen |
| Moyennes communes | 5 000 – 15 000 hab | Adjoint à la culture / secrétaire de mairie | Faible à moyen |
| Petites communes | < 2 000 hab | Maire directement / secrétaire de mairie | Faible |
| Propriétaires privés | N/A | Le propriétaire lui-même | Faible (parcours similaire à une petite commune) |

### Régions pilotes

- **Auvergne-Rhône-Alpes** : terrain de connaissance du fondateur (basé à Lyon)
- **Aube (Champagne)** : accès via le Slow Tourisme Lab, qui peut faire tester directement dans la région et donner accès à différents segments

### Différence clé propriétaires privés vs. communes

Le parcours UX est similaire, mais le moteur de matching doit intégrer le **statut juridique du propriétaire** (collectivité publique / personne privée / association) comme critère de filtrage car :
- Les propriétaires privés ont accès à des leviers fiscaux (déduction travaux MH, régime Malraux) et des fondations qui ne financent que les privés (Sauvegarde de l'Art Français, VMF)
- Certaines aides publiques sont réservées aux collectivités
- Ce statut juridique est un champ à ajouter au profil utilisateur

---

## 3. Architecture des services

Les deux services sont **interdépendants**. Le parcours-type est : diagnostic (S1) → montage (S2). Ceux qui ont besoin du S1 ont généralement besoin du S2. Ceux qui n'ont besoin que du S2 peuvent l'utiliser indépendamment.

### Service 1 : Mouline — Moteur d'identification des aides

#### Parcours utilisateur

1. L'utilisateur saisit son monument → **autocomplétion via API Mérimée** (pas d'IA à cette étape)
2. Pour les monuments hors Mérimée (patrimoine non protégé, labels autres) → **saisie manuelle** avec champs essentiels (localisation, type de protection/label, époque, usage actuel)
3. L'utilisateur sélectionne → **données officielles récupérées** (référence, commune, département, région, protection)
4. **Filtrage géographique automatique** des aides (national + région + département) — sans IA
5. **Mouline** analyse l'éligibilité en croisant données monument × critères des aides pré-filtrées
6. **Affichage** : liste d'aides avec conditions d'éligibilité factuelles, et liens vers sources officielles
7. **Veille** : alertes push quand de nouvelles aides apparaissent pour le profil du monument

#### Sources de données

- **Aides-territoires** (aides-territoires.beta.gouv.fr) : répertoire de toutes les aides publiques, mis à jour en continu
- **Base Mérimée** : base de tous les monuments historiques de France (classés et inscrits), mise à jour en continu
- Si un changement intervient sur le site de la DRAC ou d'un organisme, et qu'il est reflété dans la source, il apparaît automatiquement sur PatriAlta

#### Couverture des monuments (au-delà de Mérimée)

Mérimée ne couvre que les MH classés et inscrits. La cible PatriAlta inclut aussi :
- Sites patrimoniaux remarquables (SPR)
- Label Fondation du Patrimoine
- Patrimoine non protégé mais d'intérêt local

Certaines aides (régionales, fondations privées) sont ouvertes au patrimoine non classé/inscrit. Il faut donc prévoir un **mode de saisie manuelle** pour les monuments hors Mérimée, avec les champs : localisation, type de protection/label, époque, usage actuel.

#### Pas de score de confiance

Décision explicite : **pas de score ou de probabilité d'éligibilité**. Trop vague, peu fiable au début, risque de porter préjudice.

À la place, affichage **factuel** pour chaque aide :
- Critères d'éligibilité **remplis** par le monument ✓
- Critères **non remplis** ✗
- Critères **à vérifier / données manquantes** ?

Quand le moteur détecte une ambiguïté ou qu'il lui manque une donnée potentiellement décisive, il **demande à l'utilisateur de préciser** plutôt que de deviner. L'objectif : ne pas être responsable d'informations erronées.

#### Modes de navigation

- **Mode généraliste** (par défaut) : panel large de toutes les aides potentiellement éligibles, catégorisées et filtrables
- **Mode projet** (optionnel) : l'utilisateur précise son projet de travaux pour un matching plus précis, notamment pour les aides liées à des types de travaux spécifiques

#### Catégories d'aides

Les aides sont organisées en catégories :
1. **Conservation** (clos & couvert, structure)
2. **Restauration** (intérieur, décor)
3. **Accessibilité** (mise aux normes, accès PMR)
4. **Études préalables / diagnostics**
5. **Valorisation / médiation**
6. **Urgence / péril**

L'utilisateur peut filtrer par catégorie. Les aides peuvent aussi apparaître triées par probabilité d'éligibilité (nombre de critères remplis).

#### Périmètre des aides au lancement : 30 à 50 aides

Toutes formes d'aides sont incluses (public + privé + fondations) du moment que le monument y est éligible.

Répartition estimée des sources :
- **État/DRAC** : 3-5 dispositifs principaux (subventions MH classés, MH inscrits, FSIL patrimoine, fonds d'urgence…)
- **Région** (×2 pour AuRA + Grand Est) : 2-4 dispositifs par région
- **Département** (Rhône, Savoie, Haute-Savoie, Aube…) : 1-3 par département
- **Fondation du Patrimoine** : 2-3 dispositifs (label, souscription, Mission Patrimoine/Loto)
- **Autres fondations privées** : Sauvegarde de l'Art Français, VMF, Fondation de France, Fondation Total… → 5-10 fondations actives
- **Europe** : 1-2 (FEDER volet patrimoine, programmes Leader)
- **Mécénat/fiscal** : pas une "aide" au sens strict mais un levier à signaler

Mieux vaut 35 aides fiables que 200 mal documentées. Élargissement progressif ensuite.

#### Validation des données

- Pour la **recherche d'aides** : pas de validation humaine nécessaire. Les données s'appuient directement sur les API (Aides-territoires + Mérimée). Elles n'hallucinent pas.
- L'utilisateur peut **vérifier par lui-même** via les liens vers les sources officielles, les critères d'éligibilité affichés, les dates de validité.
- Pour la **rédaction de dossiers** (Service 2) : un humain valide systématiquement.

#### Calendrier des deadlines

Beaucoup d'aides patrimoine fonctionnent par appels à projets avec des fenêtres de dépôt. Le MVP doit :
- Afficher clairement les **dates limites de dépôt** pour chaque aide
- Intégrer un **calendrier des échéances** par monument
- Utiliser les alertes push pour prévenir des deadlines approchantes

#### Cumul des aides et plan de financement basique

Beaucoup d'aides plafonnent le financement public cumulé (souvent 80%). Le MVP doit :
- Afficher les **règles de cumul** de chaque aide (ex : "cumulable avec les aides État, plafond 80% de financement public")
- Proposer un **simulateur basique** : l'utilisateur entre le coût estimé des travaux et voit les combinaisons d'aides possibles avec les montants

L'historique des aides déjà obtenues n'est pas dans le scope MVP (donnée non disponible via API, détenue par chaque commune/propriétaire). En V2, possibilité d'intégrer cet historique pour un calcul de reste à charge cumulé plus précis.

#### Multi-monuments

Un utilisateur peut gérer **plusieurs monuments** (une commune peut avoir une église classée, un lavoir inscrit, et un château labellisé). Chaque monument a son propre profil avec ses aides éligibles.

#### Veille push

Système d'alertes : quand une nouvelle aide apparaît dans la base et qu'elle matche le profil d'un monument sauvegardé, l'utilisateur reçoit une **notification** (email). Inclut aussi les rappels de deadlines approchantes.

---

### Service 2 : Montage de dossiers de subventions

#### Fonctionnalités

- **Templates par organisme** (DRAC, conseil régional, département, Fondation du Patrimoine…)
- Le système connaît la **structure attendue**, les données requises, les pièces justificatives pour chaque organisme
- **Aide à la rédaction** : textes professionnels répondant aux codes et attentes des organismes émetteurs, données juridiques/financières calculées
- **Dashboard** pour uploader les documents, suivre l'avancement
- **Checklist dynamique des pièces** par organisme, avec statut et rappels
- **Output** : dossier structuré, prêt à envoyer (PDF/Word), qualifié et pointu

#### Cadre de responsabilité

- Le dossier est **préparé, jamais envoyé** par PatriAlta
- La **relecture humaine est obligatoire** et fortement encouragée par le design du produit
- PatriAlta fournit un template et une aide à la rédaction, mais l'utilisateur reste responsable de la soumission
- Des **disclaimers clairs** dans les CGU : PatriAlta donne un diagnostic, pas un conseil. Pas de responsabilité si une aide est ratée.

#### Pré-remplissage des données

Grâce à la continuité S1 → S2, les données déjà collectées dans le Service 1 sont réutilisées automatiquement dans le montage de dossier. L'utilisateur n'a qu'à compléter les informations spécifiques au projet (nature des travaux, devis, planning, statut propriétaire, régime fiscal). Les montants et le plan de financement sont proposés par le système sur la base du simulateur S1.

---

## 4. Onboarding et parcours progressif

L'onboarding doit être **progressif** pour ne pas perdre l'utilisateur :

1. **Étape 1** (immédiate) : saisie du monument (autocomplétion Mérimée ou saisie manuelle) → résultats immédiats en mode généraliste. La valeur apparaît dès la première interaction.
2. **Étape 2** (incitation) : compléter le profil (statut juridique du propriétaire, type de protection, labels) → résultats affinés
3. **Étape 3** (optionnel) : préciser un projet de travaux (nature, budget estimé) → mode projet avec matching précis et simulateur de financement
4. **Étape 4** (engagement) : passer au montage de dossier (S2) avec données pré-remplies

---

## 5. Export et partage

Le secrétaire de mairie doit pouvoir présenter les résultats au maire ou au conseil municipal. Le MVP inclut :
- **Export PDF** : synthèse des aides éligibles pour un monument donné, avec montants, deadlines, critères remplis
- Envoyable par email ou imprimable pour une réunion
- Format propre et professionnel

---

## 6. Données et sécurité

### Sources de données

- **Aides-territoires** (aides-territoires.beta.gouv.fr) : répertoire des aides publiques, mis à jour en continu
- **Base Mérimée** : répertoire des monuments historiques classés et inscrits de France, mis à jour en continu
- **Base interne PatriAlta** : aides des fondations privées et aides locales non couvertes par les sources précédentes, vérifiées manuellement

### RGPD et données sensibles

- Les données Mérimée sont **publiques**
- Le Service 2 (montage de dossiers) implique des **données personnelles et financières** (statut propriétaire, revenus parfois, devis, budget)
- Nécessite : hébergement en France/UE, protection des données conforme RGPD, politique de rétention claire
- À penser dès le départ dans l'architecture

---

## 7. Modèle économique

**Volontairement non défini** au stade MVP. L'objectif est de :
- Construire un MVP indépendant du mode de facturation
- Tester avec de vrais utilisateurs sur les régions pilotes
- Recueillir les avis et sonder combien les différents segments seraient prêts à payer
- Décider du modèle (abonnement, freemium, commission…) sur la base des retours terrain

L'associé de Paul est en charge de cette décision.

---

## 8. Ce qui est hors scope MVP (V2 et au-delà)

| Fonctionnalité | Raison du report |
|---|---|
| **Réseau de professionnels** (ABF, DRAC, consultants pour validation de dossiers) | Marketplace/annuaire avec mise en relation et éventuellement commission. Change la nature du produit. |
| **Suivi post-dépôt** (tracking statut : déposé → en instruction → accordé/refusé) | Identifié comme nécessaire mais ajout de complexité trop important pour le MVP |
| **Mode collaboratif** (plusieurs contributeurs sur un même dossier) | Pertinent (maire + secrétaire + architecte) mais secondaire pour le lancement |
| **Envoi dématérialisé des dossiers** | Plateformes de dépôt hétérogènes (démarches-simplifiées, formulaires propres), gouffre de développement |
| **Historique des aides obtenues** | Donnée non centralisée, détenue par chaque commune/propriétaire. Le MVP affiche les règles de cumul à la place. |
| **Chatbot/assistant conversationnel** | Complexe à bien faire. Un parcours guidé classique bien pensé suffit. |
| **Analytics poussés** | Au stade MVP, le feedback qualitatif direct est plus utile que des métriques. |

---

## 9. Critères de succès du MVP

Le MVP est considéré comme réussi si :
- L'utilisateur peut **trouver rapidement les aides** auxquelles son monument est éligible
- Le système produit un **dossier de subvention précis et pointu** qui répond aux codes et aux attentes des organismes émetteurs
- Le dossier est **qualifié** (structure correcte, données pertinentes, langage institutionnel)
- Toutes les fonctionnalités décrites dans cette spécification sont **en place et fonctionnelles**
- Les retours des utilisateurs-test sur les régions pilotes sont positifs

---

## 10. Récapitulatif des fonctionnalités MVP

### Service 1 — Mouline

- [ ] Autocomplétion monument via API Mérimée
- [ ] Saisie manuelle pour monuments hors Mérimée (SPR, labels, patrimoine non protégé)
- [ ] Récupération données officielles (ref, commune, département, région, protection)
- [ ] Filtrage géographique automatique des aides (national + région + département)
- [ ] Analyse d'éligibilité croisant données monument × critères des aides
- [ ] Affichage critères factuels : rempli ✓ / non rempli ✗ / à vérifier ?
- [ ] Demande de précision à l'utilisateur quand donnée manquante est décisive
- [ ] Catégorisation des aides (conservation, restauration, accessibilité, études, valorisation, urgence)
- [ ] Filtres par catégorie
- [ ] Mode généraliste (par défaut) + mode projet (optionnel, préciser les travaux)
- [ ] Statut juridique du propriétaire comme critère de filtrage (collectivité / privé / association)
- [ ] Calendrier des deadlines par aide
- [ ] Règles de cumul affichées par aide
- [ ] Simulateur de plan de financement basique (coût travaux → combinaisons d'aides possibles)
- [ ] Multi-monuments par utilisateur
- [ ] Veille push : alertes nouvelles aides + rappels deadlines
- [ ] Liens vers sources officielles pour chaque aide
- [ ] Export PDF synthèse des aides éligibles

### Service 2 — Montage de dossiers

- [ ] Templates par organisme (DRAC, conseil régional, département, FdP…)
- [ ] Structure attendue, données requises, pièces justificatives par organisme
- [ ] Pré-remplissage des données depuis le profil monument (S1)
- [ ] Aide à la rédaction : textes professionnels, langage institutionnel
- [ ] Données juridiques/financières calculées
- [ ] Dashboard upload de documents
- [ ] Checklist dynamique des pièces par organisme avec statut
- [ ] Suivi d'avancement du dossier
- [ ] Output : dossier structuré PDF/Word prêt à envoyer
- [ ] Incitation forte à la relecture humaine dans le design

### Transversal

- [ ] Onboarding progressif (valeur immédiate dès l'étape 1)
- [ ] Profil utilisateur (statut juridique, commune/privé)
- [ ] Profil monument sauvegardable (multi-monuments)
- [ ] Export PDF partageable
- [ ] 30-50 aides référencées au lancement sur 2 régions pilotes (AuRA + Aube)
- [ ] Sources de données : Aides-territoires + Mérimée + base interne (fondations privées)
- [ ] Disclaimers et CGU clairs sur la responsabilité
- [ ] Conformité RGPD (hébergement FR/UE, protection des données, politique de rétention)