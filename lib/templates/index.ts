import type { Template } from '@/lib/s2/types'
import { templateDrac } from './drac'
import { templateAura } from './aura'
import { templateFdp } from './fdp'

const TEMPLATES: Record<string, Template> = {
  drac: templateDrac,
  aura: templateAura,
  fdp: templateFdp,
}

export const templateGenerique: Template = {
  organisme_id: 'generique',
  organisme_nom: 'Organisme financeur',
  prompt_version: 'generic-v1.0',
  sections: [
    {
      id: 'presentation',
      titre: 'Présentation du projet',
      instructions_prompt:
        "Rédige une présentation générale du monument et du projet de travaux envisagé (200-300 mots). Utilise un ton administratif et factuel.",
      obligatoire: true,
      pieces_justificatives: ['Photos du monument', 'Titre de propriété ou attestation'],
    },
    {
      id: 'plan_financement',
      titre: 'Plan de financement',
      instructions_prompt:
        "Présente un cadre de plan de financement prévisionnel. Rappelle les règles générales de cumul des aides pour les monuments historiques.",
      obligatoire: true,
      pieces_justificatives: ['Devis estimatif', 'Tableau de financement'],
    },
  ],
}

/** Retourne le template correspondant à un organisme, ou le template générique en fallback */
export function getTemplate(organismeId: string): Template {
  return TEMPLATES[organismeId.toLowerCase()] ?? templateGenerique
}

export { templateDrac, templateAura, templateFdp }
