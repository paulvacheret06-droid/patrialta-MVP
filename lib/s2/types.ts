/**
 * S2 — Montage : interfaces TypeScript pour la génération de dossiers
 * Ces interfaces sont définies AVANT tout code applicatif (convention projet)
 */

// ---------------------------------------------------------------------------
// Contenu généré par Claude API
// ---------------------------------------------------------------------------

export interface SectionDossier {
  id: string
  titre: string
  contenu: string
  is_edite: boolean // true si l'utilisateur a modifié manuellement
}

/** Structure du dossier généré — stockée en JSONB dans la table dossiers */
export interface ContenuDossier {
  sections: SectionDossier[]
  generated_at: string
  is_complete: boolean
}

// ---------------------------------------------------------------------------
// Templates par organisme (stockés en TypeScript statique dans /lib/templates/)
// ---------------------------------------------------------------------------

export interface SectionTemplate {
  id: string
  titre: string
  instructions_prompt: string // Instructions données à Claude pour cette section
  obligatoire: boolean
  pieces_justificatives: string[]
}

/**
 * Template de dossier pour un organisme donné.
 * Le champ prompt_version permet de tracer quelle version a été utilisée.
 */
export interface Template {
  organisme_id: string
  organisme_nom: string
  sections: SectionTemplate[]
  prompt_version: string
}

// ---------------------------------------------------------------------------
// Statuts
// ---------------------------------------------------------------------------

export type DossierStatut = 'brouillon' | 'en_cours' | 'finalise'
export type DocumentStatut = 'manquant' | 'uploade' | 'valide'
export type AlertType = 'nouvelle_aide' | 'deadline_approche'
export type AlertStatut = 'pending' | 'sent' | 'dismissed'

// ---------------------------------------------------------------------------
// Simulateur de financement
// ---------------------------------------------------------------------------

export interface SimulationAide {
  id: string
  nom: string
  montant_estime: number
  taux: number
}

export interface SimulationCombination {
  aides: SimulationAide[]
  total_estime: number
  taux_couverture: number
  respecte_plafond: boolean
}

export interface SimulationResult {
  combinations: SimulationCombination[]
  budget_total: number
}
