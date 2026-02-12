/**
 * Template DRAC — Direction Régionale des Affaires Culturelles
 * Dossier de demande de subvention pour travaux sur monuments historiques classés/inscrits
 */

import type { Template } from '@/lib/s2/types'

export const templateDrac: Template = {
  organisme_id: 'drac',
  organisme_nom: 'Direction Régionale des Affaires Culturelles (DRAC)',
  prompt_version: 'drac-v1.0',
  sections: [
    {
      id: 'presentation_monument',
      titre: 'Présentation du monument',
      instructions_prompt:
        "Rédige une présentation factuelle du monument historique en 200-300 mots. Inclus : dénomination officielle, commune, date de protection, type de protection (classé/inscrit), époque de construction, usage actuel. Utilise un ton administratif et précis. Ne fais aucune supposition sur les informations non fournies.",
      obligatoire: true,
      pieces_justificatives: [
        "Arrêté de classement ou d'inscription",
        'Plans et photographies actuels du monument',
      ],
    },
    {
      id: 'description_travaux',
      titre: 'Description des travaux envisagés',
      instructions_prompt:
        "Décris les travaux de conservation/restauration en 300-400 mots. Utilise la terminologie technique appropriée aux monuments historiques. Précise : nature des travaux, techniques employées, matériaux, surface concernée. Si le type de travaux n'est pas précisé, mentionne qu'une étude préalable sera nécessaire.",
      obligatoire: true,
      pieces_justificatives: [
        'Devis estimatif détaillé',
        "Note méthodologique de l'architecte du patrimoine (ABF/ACMH)",
        'Photos avant travaux',
      ],
    },
    {
      id: 'justification_urgence',
      titre: 'Justification de la nécessité des travaux',
      instructions_prompt:
        "Explique pourquoi ces travaux sont nécessaires et urgents (50-150 mots). Mentionne les risques pour la conservation du monument en l'absence d'intervention.",
      obligatoire: false,
      pieces_justificatives: ["Rapport d'état sanitaire du monument"],
    },
    {
      id: 'plan_financement',
      titre: 'Plan de financement prévisionnel',
      instructions_prompt:
        "Rédige un cadre de plan de financement. Rappelle les règles de cumul d'aides applicables aux monuments historiques (plafond financement public 80% pour les monuments classés, 40% pour les inscrits selon les cas). Note : les montants exacts seront complétés par le demandeur.",
      obligatoire: true,
      pieces_justificatives: ['Tableau de financement détaillé'],
    },
  ],
}
