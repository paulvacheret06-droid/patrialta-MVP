/**
 * S1 — Mouline : interfaces TypeScript du moteur d'éligibilité
 * Logique 100% déterministe — aucun LLM
 * Ces interfaces sont définies AVANT tout code applicatif (convention projet)
 */

// ---------------------------------------------------------------------------
// Données monument
// ---------------------------------------------------------------------------

export type TypeProtection =
  | 'classe'
  | 'inscrit'
  | 'spr'
  | 'label_fdp'
  | 'non_protege'

export type StatutJuridique = 'collectivite' | 'prive' | 'association'

export interface Monument {
  id: string
  user_id: string
  nom: string
  ref_merimee: string | null
  is_verified_merimee: boolean
  commune: string
  departement: string
  region: string
  type_protection: TypeProtection | null
  epoque: string | null
  usage_actuel: string | null
  latitude: number | null
  longitude: number | null
  // Champs mode projet (optionnels)
  description_projet: string | null
  type_travaux: string[] | null
  budget_estime: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Données aide
// ---------------------------------------------------------------------------

export type TypeAide = 'subvention' | 'pret' | 'garantie' | 'avantage_fiscal' | 'appel_projet'
export type SourceAide = 'etat' | 'region' | 'departement' | 'fondation' | 'europe'
export type CategorieAide =
  | 'conservation'
  | 'restauration'
  | 'accessibilite'
  | 'etudes'
  | 'valorisation'
  | 'urgence'

export interface ReglesCumul {
  plafond_financement_public?: number
  cumulable_avec?: string[]
  non_cumulable_avec?: string[]
  notes?: string
}

export interface Aide {
  id: string
  nom: string
  organisme: string
  type_aide: TypeAide
  source: SourceAide
  categorie: CategorieAide
  region_eligible: string | null
  departement_eligible: string | null
  statut_juridique_eligible: StatutJuridique[]
  type_monument_eligible: TypeProtection[]
  type_travaux_eligible: string[]
  date_depot_debut: string | null
  date_depot_fin: string | null
  montant_max: number | null
  taux_max: number | null
  plafond_financement_public: number | null
  regles_cumul: ReglesCumul | null
  url_source: string
  external_id: string | null
  last_synced_at: string | null
  is_active: boolean
}

// ---------------------------------------------------------------------------
// Moteur d'éligibilité
// ---------------------------------------------------------------------------

export type OperateurCritere = 'eq' | 'in' | 'gte' | 'lte' | 'contains' | 'not_null'
export type StatutCritere = 'rempli' | 'non_rempli' | 'a_verifier'

/** Critère d'éligibilité élémentaire */
export interface Critere {
  champ: string
  operateur: OperateurCritere
  valeur: unknown
  label_humain: string // ex: "Type de protection : classé ou inscrit"
}

/** Résultat d'évaluation d'un critère individuel */
export interface CritereResult {
  critere: Critere
  statut: StatutCritere
  valeur_monument?: unknown
}

/** Résultat complet pour un couple monument × aide */
export interface ResultatEligibilite {
  monument_id: string
  aide_id: string
  statut: 'eligible' | 'non_eligible' | 'incomplet'
  criteres_remplis: CritereResult[]
  criteres_manquants: CritereResult[]
  criteres_a_verifier: CritereResult[]
}
