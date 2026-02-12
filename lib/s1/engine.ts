/**
 * S1 — Mouline : moteur d'éligibilité
 * Logique 100% déterministe, TypeScript pur — aucun LLM
 * Testable unitairement avec des données fixes
 */

import type { Aide, Critere, CritereResult, Monument, ResultatEligibilite, StatutCritere } from './types'

// ---------------------------------------------------------------------------
// Évaluation d'un critère individuel
// ---------------------------------------------------------------------------

function evaluerCritere(monument: Monument, critere: Critere): CritereResult {
  const valeurMonument = (monument as unknown as Record<string, unknown>)[critere.champ]

  // Donnée absente → à vérifier
  if (valeurMonument === null || valeurMonument === undefined) {
    return { critere, statut: 'a_verifier', valeur_monument: valeurMonument }
  }

  let statut: StatutCritere

  switch (critere.operateur) {
    case 'eq':
      statut = valeurMonument === critere.valeur ? 'rempli' : 'non_rempli'
      break

    case 'in':
      statut = Array.isArray(critere.valeur) && critere.valeur.includes(valeurMonument)
        ? 'rempli'
        : 'non_rempli'
      break

    case 'gte':
      statut =
        typeof valeurMonument === 'number' && typeof critere.valeur === 'number'
          ? valeurMonument >= critere.valeur ? 'rempli' : 'non_rempli'
          : 'a_verifier'
      break

    case 'lte':
      statut =
        typeof valeurMonument === 'number' && typeof critere.valeur === 'number'
          ? valeurMonument <= critere.valeur ? 'rempli' : 'non_rempli'
          : 'a_verifier'
      break

    case 'contains':
      statut =
        Array.isArray(valeurMonument) && valeurMonument.includes(critere.valeur)
          ? 'rempli'
          : 'non_rempli'
      break

    case 'not_null':
      statut = valeurMonument !== null && valeurMonument !== undefined ? 'rempli' : 'non_rempli'
      break

    default:
      statut = 'a_verifier'
  }

  return { critere, statut, valeur_monument: valeurMonument }
}

// ---------------------------------------------------------------------------
// Construction des critères à partir d'une aide
// ---------------------------------------------------------------------------

function buildCriteres(aide: Aide): Critere[] {
  const criteres: Critere[] = []

  if (aide.statut_juridique_eligible.length > 0) {
    criteres.push({
      champ: 'statut_juridique',
      operateur: 'in',
      valeur: aide.statut_juridique_eligible,
      label_humain: `Statut juridique : ${aide.statut_juridique_eligible.join(' ou ')}`,
    })
  }

  if (aide.type_monument_eligible.length > 0) {
    criteres.push({
      champ: 'type_protection',
      operateur: 'in',
      valeur: aide.type_monument_eligible,
      label_humain: `Protection monument : ${aide.type_monument_eligible.join(' ou ')}`,
    })
  }

  if (aide.region_eligible) {
    criteres.push({
      champ: 'region',
      operateur: 'eq',
      valeur: aide.region_eligible,
      label_humain: `Région : ${aide.region_eligible}`,
    })
  }

  if (aide.departement_eligible) {
    criteres.push({
      champ: 'departement',
      operateur: 'eq',
      valeur: aide.departement_eligible,
      label_humain: `Département : ${aide.departement_eligible}`,
    })
  }

  return criteres
}

// ---------------------------------------------------------------------------
// Fonction principale — pure et testable unitairement
// ---------------------------------------------------------------------------

/**
 * Évalue l'éligibilité d'un monument pour une aide donnée.
 * Résultats reproductibles : mêmes entrées → mêmes sorties.
 */
/**
 * Évalue l'éligibilité d'un monument pour un lot d'aides.
 * Résultats ordonnés dans le même ordre que le tableau d'entrée.
 */
export function evaluerEligibilites(monument: Monument, aides: Aide[]): ResultatEligibilite[] {
  return aides.map((aide) => evaluerEligibilite(monument, aide))
}

export function evaluerEligibilite(monument: Monument, aide: Aide): ResultatEligibilite {
  const criteres = buildCriteres(aide)
  const results = criteres.map((c) => evaluerCritere(monument, c))

  const criteres_remplis = results.filter((r) => r.statut === 'rempli')
  const criteres_manquants = results.filter((r) => r.statut === 'non_rempli')
  const criteres_a_verifier = results.filter((r) => r.statut === 'a_verifier')

  let statut: ResultatEligibilite['statut']
  if (criteres_manquants.length > 0) {
    statut = 'non_eligible'
  } else if (criteres_a_verifier.length > 0) {
    statut = 'incomplet'
  } else {
    statut = 'eligible'
  }

  return {
    monument_id: monument.id,
    aide_id: aide.id,
    statut,
    criteres_remplis,
    criteres_manquants,
    criteres_a_verifier,
  }
}
