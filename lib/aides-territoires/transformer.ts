/**
 * Transformer : mappe les champs Aides-territoires vers le schéma PatriAlta `aides`.
 */
import type { AideTerritorie } from '@/lib/validations/aides-territoires'
import type { Aide, SourceAide, CategorieAide } from '@/lib/s1/types'

// Mapping des catégories Aides-territoires → catégories PatriAlta
const CATEGORIE_MAP: Record<string, CategorieAide> = {
  'restauration': 'restauration',
  'conservation': 'conservation',
  'réhabilitation': 'restauration',
  'rénovation': 'restauration',
  'accessibilite': 'accessibilite',
  'accessibilité': 'accessibilite',
  'etudes': 'etudes',
  'études': 'etudes',
  'valorisation': 'valorisation',
  'tourisme': 'valorisation',
  'urgence': 'urgence',
}

// Mapping organisme → source
const SOURCE_MAP: Record<string, SourceAide> = {
  'région': 'region',
  'departement': 'departement',
  'département': 'departement',
  'état': 'etat',
  'etat': 'etat',
  'fondation': 'fondation',
  'europe': 'europe',
  'union européenne': 'europe',
}

function detectCategorie(aide: AideTerritorie): CategorieAide {
  const text = [
    aide.name,
    aide.description,
    ...aide.categories,
    ...aide.programs,
  ]
    .join(' ')
    .toLowerCase()

  for (const [keyword, cat] of Object.entries(CATEGORIE_MAP)) {
    if (text.includes(keyword)) return cat
  }
  return 'restauration' // fallback
}

function detectSource(aide: AideTerritorie): SourceAide {
  const organisme = aide.financers.join(' ').toLowerCase()

  for (const [keyword, source] of Object.entries(SOURCE_MAP)) {
    if (organisme.includes(keyword)) return source
  }
  return 'etat' // fallback
}

function extractOrganisme(aide: AideTerritorie): string {
  return aide.financers.join(', ') || 'Organisme non précisé'
}

/**
 * Transforme un objet Aides-territoires brut en objet `Partial<Aide>` PatriAlta.
 * Les champs non disponibles dans l'API sont laissés à null / vides.
 */
export function transformAideTerritorie(raw: AideTerritorie): Omit<Aide, 'id'> {
  return {
    nom: raw.name,
    organisme: extractOrganisme(raw),
    type_aide: 'subvention',
    source: detectSource(raw),
    categorie: detectCategorie(raw),
    region_eligible: null,
    departement_eligible: null,
    statut_juridique_eligible: [],
    type_monument_eligible: [],
    type_travaux_eligible: [],
    date_depot_debut: raw.start_date ?? null,
    date_depot_fin: raw.submission_deadline ?? null,
    montant_max: null,
    taux_max: null,
    plafond_financement_public: null,
    regles_cumul: null,
    url_source: raw.origin_url ?? raw.url ?? '',
    external_id: raw.id,
    last_synced_at: new Date().toISOString(),
    is_active: raw.is_live ?? true,
    // Champs non dans l'interface de base mais présents dans la table
    organisme_nom: extractOrganisme(raw),
    organisme_id: detectSource(raw),
    description: raw.description ?? null,
  } as unknown as Omit<Aide, 'id'>
}
