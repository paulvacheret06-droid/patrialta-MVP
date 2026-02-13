/**
 * Tests unitaires — Moteur S1 Mouline
 * Logique 100% déterministe, aucun réseau ni base de données
 */

import { describe, it, expect } from 'vitest'
import { evaluerEligibilite, evaluerEligibilites } from '../../lib/s1/engine'
import type { Monument, Aide } from '../../lib/s1/types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MONUMENT_CLASSE_COLLECTIVITE: Monument = {
  id: 'mon-1',
  user_id: 'user-1',
  nom: 'Cathédrale Saint-Jean',
  ref_merimee: 'PA00117741',
  is_verified_merimee: true,
  commune: 'Lyon',
  departement: 'Rhône',
  region: 'Auvergne-Rhône-Alpes',
  type_protection: 'classe',
  epoque: null,
  usage_actuel: null,
  latitude: 45.762,
  longitude: 4.827,
  description_projet: null,
  type_travaux: null,
  budget_estime: null,
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  // statut_juridique n'est pas dans l'interface Monument standard mais est nécessaire pour le moteur
  statut_juridique: 'collectivite',
} as unknown as Monument

const MONUMENT_INSCRIT_PRIVE: Monument = {
  ...MONUMENT_CLASSE_COLLECTIVITE,
  id: 'mon-2',
  type_protection: 'inscrit',
  statut_juridique: 'prive',
} as unknown as Monument

const MONUMENT_SANS_PROTECTION: Monument = {
  ...MONUMENT_CLASSE_COLLECTIVITE,
  id: 'mon-3',
  type_protection: null,
  region: null,
  statut_juridique: 'collectivite',
} as unknown as Monument

const AIDE_DRAC_CLASSES: Aide = {
  id: 'aide-1',
  nom: 'Subvention DRAC — MH classés',
  organisme: 'DRAC',
  type_aide: 'subvention',
  source: 'etat',
  categorie: 'restauration',
  region_eligible: null,
  departement_eligible: null,
  statut_juridique_eligible: ['collectivite', 'prive', 'association'],
  type_monument_eligible: ['classe'],
  type_travaux_eligible: [],
  date_depot_debut: null,
  date_depot_fin: null,
  montant_max: null,
  taux_max: 0.5,
  plafond_financement_public: 0.8,
  regles_cumul: null,
  url_source: 'https://example.com/drac',
  external_id: null,
  last_synced_at: null,
  is_active: true,
}

const AIDE_COLLECTIVITE_UNIQUEMENT: Aide = {
  ...AIDE_DRAC_CLASSES,
  id: 'aide-2',
  nom: 'FSIL Patrimoine',
  statut_juridique_eligible: ['collectivite'],
  type_monument_eligible: ['classe', 'inscrit'],
}

const AIDE_REGION_AURA: Aide = {
  ...AIDE_DRAC_CLASSES,
  id: 'aide-3',
  nom: 'Aide régionale AuRA',
  region_eligible: 'Auvergne-Rhône-Alpes',
  statut_juridique_eligible: ['collectivite', 'association'],
  type_monument_eligible: ['classe', 'inscrit', 'spr'],
}

// ---------------------------------------------------------------------------
// Cas 1 : critère rempli — monument classé, aide pour classés
// ---------------------------------------------------------------------------

describe('evaluerEligibilite — critère rempli', () => {
  it('monument classé + aide réservée aux classés → critère type_protection dans criteres_remplis', () => {
    const resultat = evaluerEligibilite(MONUMENT_CLASSE_COLLECTIVITE, AIDE_DRAC_CLASSES)

    const critereProtection = resultat.criteres_remplis.find(
      (r) => r.critere.champ === 'type_protection'
    )
    expect(critereProtection).toBeDefined()
    expect(critereProtection?.statut).toBe('rempli')
  })
})

// ---------------------------------------------------------------------------
// Cas 2 : critère non rempli — statut_juridique exclusif
// ---------------------------------------------------------------------------

describe('evaluerEligibilite — critère non rempli', () => {
  it('monument privé + aide collectivité uniquement → critère statut_juridique dans criteres_manquants', () => {
    const resultat = evaluerEligibilite(MONUMENT_INSCRIT_PRIVE, AIDE_COLLECTIVITE_UNIQUEMENT)

    const critereStatut = resultat.criteres_manquants.find(
      (r) => r.critere.champ === 'statut_juridique'
    )
    expect(critereStatut).toBeDefined()
    expect(critereStatut?.statut).toBe('non_rempli')
    expect(resultat.statut).toBe('non_eligible')
  })
})

// ---------------------------------------------------------------------------
// Cas 3 : valeur null + critère présent → à vérifier
// ---------------------------------------------------------------------------

describe('evaluerEligibilite — valeur null → a_verifier', () => {
  it('monument sans région + aide limitée à AuRA → critère region dans criteres_a_verifier', () => {
    const resultat = evaluerEligibilite(MONUMENT_SANS_PROTECTION, AIDE_REGION_AURA)

    const critereRegion = resultat.criteres_a_verifier.find(
      (r) => r.critere.champ === 'region'
    )
    expect(critereRegion).toBeDefined()
    expect(critereRegion?.statut).toBe('a_verifier')
    // Pas de critère non rempli → statut incomplet (pas non_eligible)
    expect(resultat.statut).not.toBe('non_eligible')
  })
})

// ---------------------------------------------------------------------------
// Cas 4 : tous critères remplis → est_eligible (statut: 'eligible')
// ---------------------------------------------------------------------------

describe('evaluerEligibilite — tous critères remplis', () => {
  it('monument classé collectivité en AuRA + aide AuRA → statut eligible', () => {
    const resultat = evaluerEligibilite(MONUMENT_CLASSE_COLLECTIVITE, AIDE_REGION_AURA)

    expect(resultat.criteres_manquants).toHaveLength(0)
    expect(resultat.criteres_a_verifier).toHaveLength(0)
    expect(resultat.statut).toBe('eligible')
  })
})

// ---------------------------------------------------------------------------
// Cas 5 : evaluerEligibilites — batch ordonné
// ---------------------------------------------------------------------------

describe('evaluerEligibilites — lot ordonné', () => {
  it('retourne autant de résultats que d\'aides, dans le même ordre', () => {
    const aides = [AIDE_DRAC_CLASSES, AIDE_COLLECTIVITE_UNIQUEMENT, AIDE_REGION_AURA]
    const resultats = evaluerEligibilites(MONUMENT_CLASSE_COLLECTIVITE, aides)

    expect(resultats).toHaveLength(3)
    expect(resultats[0].aide_id).toBe(AIDE_DRAC_CLASSES.id)
    expect(resultats[1].aide_id).toBe(AIDE_COLLECTIVITE_UNIQUEMENT.id)
    expect(resultats[2].aide_id).toBe(AIDE_REGION_AURA.id)
  })

  it('tableau vide → tableau vide', () => {
    const resultats = evaluerEligibilites(MONUMENT_CLASSE_COLLECTIVITE, [])
    expect(resultats).toHaveLength(0)
  })
})
