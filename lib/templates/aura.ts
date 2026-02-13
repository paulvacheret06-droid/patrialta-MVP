/**
 * Template Région Auvergne-Rhône-Alpes — Aide patrimoine
 * Dispositif d'aide à la restauration du patrimoine architectural et urbain
 */

import type { Template } from '@/lib/s2/types'

export const templateAura: Template = {
  organisme_id: 'aura',
  organisme_nom: 'Région Auvergne-Rhône-Alpes',
  prompt_version: 'aura-v1.0',
  sections: [
    {
      id: 'contexte_patrimonial',
      titre: 'Contexte patrimonial',
      instructions_prompt:
        "Décris le contexte patrimonial du monument (200-250 mots). Précise son importance pour le territoire local, son histoire, son usage actuel et sa valeur culturelle ou touristique. Mentionne les éventuels labels ou reconnaissances officielles (classement, inscription, SPR…).",
      obligatoire: true,
      pieces_justificatives: [
        "Arrêté de classement ou d'inscription (si applicable)",
        'Photos représentatives du monument',
        'Extrait cadastral',
      ],
    },
    {
      id: 'projet_restauration',
      titre: 'Projet de restauration',
      instructions_prompt:
        "Décris le projet de restauration en 300-350 mots. Précise la nature des travaux envisagés, les techniques employées, les matériaux, les surfaces concernées et le calendrier prévisionnel. Mets en valeur l'intérêt du projet pour la préservation du patrimoine régional.",
      obligatoire: true,
      pieces_justificatives: [
        'Devis détaillé signé par un architecte du patrimoine',
        'Notice descriptive des travaux',
        'Photos avant travaux',
      ],
    },
    {
      id: 'budget_cofinancements',
      titre: 'Budget et cofinancements',
      instructions_prompt:
        "Présente le budget prévisionnel et le plan de cofinancement (150-200 mots). Identifie les autres sources de financement sollicitées ou obtenues (DRAC, département, fondations…). Rappelle que la Région AuRA finance généralement jusqu'à 30% du montant HT des travaux.",
      obligatoire: true,
      pieces_justificatives: [
        'Tableau de financement détaillé',
        'Justificatifs des cofinancements obtenus ou sollicités',
      ],
    },
    {
      id: 'impact_territorial',
      titre: 'Impact territorial et valorisation',
      instructions_prompt:
        "Décris l'impact du projet sur le territoire (100-150 mots) : attractivité touristique, emploi local, rayonnement culturel, accessibilité au public. Précise les actions de valorisation prévues (visites, événements, signalétique…).",
      obligatoire: false,
      pieces_justificatives: [],
    },
  ],
}
