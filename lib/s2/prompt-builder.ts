/**
 * S2 — Construction du prompt Claude pour la génération de dossiers.
 *
 * Minimisation RGPD :
 * - Pas de nom de propriétaire, prénom, email, téléphone dans le prompt
 * - Uniquement les données patrimoniales (monument, aide, éligibilité)
 * - L'identité du demandeur n'est jamais envoyée à Claude
 */

import type { Template, SectionTemplate } from '@/lib/s2/types'

interface MonumentData {
  nom: string
  commune: string
  departement: string
  region: string
  type_monument: string
  type_protection: string | null
  description_projet: string | null
  type_travaux: string[] | null
  budget_estime: number | null
}

interface AideData {
  nom: string
  organisme_nom: string
  description: string | null
  montant_max: number | null
  taux_max: number | null
  date_depot_fin: string | null
}

interface EligibilityData {
  criteres_remplis: { label: string }[]
  criteres_a_verifier: { label: string }[]
}

interface PromptInput {
  monument: MonumentData
  aide: AideData
  eligibility: EligibilityData
  template: Template
  sectionId: string // Quelle section générer
}

/**
 * Construit le prompt pour générer une section spécifique du dossier.
 * Retourne le prompt complet à envoyer à Claude.
 */
export function buildSectionPrompt(input: PromptInput): string {
  const { monument, aide, eligibility, template, sectionId } = input

  const section = template.sections.find((s: SectionTemplate) => s.id === sectionId)
  if (!section) throw new Error(`Section introuvable : ${sectionId}`)

  const critereRemplis = eligibility.criteres_remplis.map((c) => `- ${c.label}`).join('\n')
  const critereAVerifier = eligibility.criteres_a_verifier.map((c) => `- ${c.label}`).join('\n')

  const travaux = monument.type_travaux?.length
    ? monument.type_travaux.join(', ')
    : 'non précisé'

  const budget = monument.budget_estime
    ? `${monument.budget_estime.toLocaleString('fr-FR')} €`
    : 'non précisé'

  const taux = aide.taux_max ? `${Math.round(aide.taux_max * 100)}%` : 'non précisé'
  const montantMax = aide.montant_max
    ? `${aide.montant_max.toLocaleString('fr-FR')} €`
    : 'non précisé'
  const deadline = aide.date_depot_fin
    ? new Date(aide.date_depot_fin).toLocaleDateString('fr-FR')
    : 'non précisée'

  return `Tu es un expert en montage de dossiers de subvention pour le patrimoine historique français.

## Contexte du monument
- Nom : ${monument.nom}
- Commune : ${monument.commune} (${monument.departement}, ${monument.region})
- Type : ${monument.type_monument}
- Protection : ${monument.type_protection ?? 'aucune protection officielle'}
- Travaux envisagés : ${travaux}
- Budget estimé : ${budget}
${monument.description_projet ? `- Description du projet : ${monument.description_projet}` : ''}

## Aide demandée
- Aide : ${aide.nom}
- Organisme : ${aide.organisme_nom}
${aide.description ? `- Description : ${aide.description}` : ''}
- Taux de financement : ${taux}
- Montant maximum : ${montantMax}
- Date limite de dépôt : ${deadline}

## Critères d'éligibilité
Critères remplis :
${critereRemplis || '- Aucun critère vérifié'}

Critères à vérifier :
${critereAVerifier || '- Aucun critère à vérifier'}

## Section à rédiger : ${section.titre}

${section.instructions_prompt}

## Consignes importantes
- Rédige uniquement le contenu de la section "${section.titre}", sans titres ni introduction supplémentaires
- Utilise un français administratif, précis et professionnel
- Adapte le contenu aux informations fournies sur le monument et l'aide
- N'invente pas d'informations absentes (montants précis, noms propres, dates non fournies)
- Si une information manque, indique qu'elle devra être complétée par le demandeur
- Le texte est destiné à ${aide.organisme_nom} — adapte le ton et les références à cet organisme

Rédige maintenant la section :`.trim()
}

/**
 * Construit le prompt système commun à toutes les générations.
 */
export function buildSystemPrompt(): string {
  return `Tu es un assistant spécialisé dans la rédaction de dossiers de demande de subvention pour le patrimoine historique en France. Tu rédiges des textes administratifs précis, factuels et professionnels, adaptés aux attentes des organismes financeurs (DRAC, régions, fondations). Tu n'inventes jamais d'informations non fournies et tu indiques clairement ce qui devra être complété par le demandeur.`
}
