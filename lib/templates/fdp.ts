/**
 * Template Fondation du Patrimoine
 * Dossier de demande de subvention pour la restauration du petit patrimoine
 */

import type { Template } from '@/lib/s2/types'

export const templateFdp: Template = {
  organisme_id: 'fdp',
  organisme_nom: 'Fondation du Patrimoine',
  prompt_version: 'fdp-v1.0',
  sections: [
    {
      id: 'presentation_bien',
      titre: 'Présentation du bien',
      instructions_prompt:
        "Rédige une présentation du bien patrimonial en 200-250 mots. Décris sa nature (bâtiment religieux, manoir, moulin, lavoir…), sa localisation, son époque de construction, ses caractéristiques architecturales distinctives, et son statut actuel (propriétaire, usage, accessibilité). Mentionne son éventuel statut de protection (classé, inscrit, non protégé) ou son appartenance à une zone de patrimoine remarquable.",
      obligatoire: true,
      pieces_justificatives: [
        'Photos extérieures et intérieures du bien',
        "Titre de propriété ou attestation de l'organisme propriétaire",
        'Extrait cadastral',
      ],
    },
    {
      id: 'interet_patrimonial',
      titre: 'Intérêt patrimonial et historique',
      instructions_prompt:
        "Démontre l'intérêt patrimonial et historique du bien en 150-200 mots. Explique sa valeur pour le territoire (histoire locale, architecture, identité culturelle, mémoire collective). Mentionne tout lien avec des personnages historiques, des événements marquants ou des savoir-faire artisanaux. La Fondation du Patrimoine finance prioritairement les biens non protégés à forte valeur locale : mets en avant ce qui rend ce bien irremplaçable pour la communauté.",
      obligatoire: true,
      pieces_justificatives: [
        'Sources historiques ou bibliographiques (si disponibles)',
      ],
    },
    {
      id: 'projet_planning',
      titre: 'Projet de travaux et planning',
      instructions_prompt:
        "Décris le projet de restauration en 250-300 mots. Précise la nature des travaux (toiture, maçonnerie, menuiseries, ravalement…), les techniques de restauration à l'identique, les matériaux traditionnels utilisés, les surfaces concernées et le calendrier prévisionnel (début, durée, phases). Souligne l'appel à des artisans qualifiés locaux si applicable. La Fondation soutient les approches respectueuses des techniques d'origine.",
      obligatoire: true,
      pieces_justificatives: [
        "Devis détaillé d'un ou plusieurs artisans ou entreprises spécialisées",
        'Notice descriptive des travaux',
        'Photos de détail des zones à restaurer',
      ],
    },
    {
      id: 'plan_financement',
      titre: 'Plan de financement',
      instructions_prompt:
        "Présente le plan de financement prévisionnel en 100-150 mots. Identifie les cofinancements obtenus ou sollicités (DRAC, région, département, communes, mécénat…). Rappelle que la Fondation du Patrimoine peut financer entre 5% et 50% du montant HT des travaux selon les cas, et que la collecte de dons via souscription publique est une option pour compléter le financement. Note que les montants exacts seront complétés par le demandeur.",
      obligatoire: true,
      pieces_justificatives: [
        'Tableau de financement détaillé',
        'Justificatifs des cofinancements déjà obtenus',
      ],
    },
  ],
}
