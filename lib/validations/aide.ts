import { z } from 'zod'

const TypeAideValues = ['subvention', 'pret', 'garantie', 'avantage_fiscal', 'appel_projet'] as const
const SourceAideValues = ['etat', 'region', 'departement', 'fondation', 'europe'] as const
const CategorieAideValues = [
  'conservation',
  'restauration',
  'accessibilite',
  'etudes',
  'valorisation',
  'urgence',
] as const
const StatutJuridiqueValues = ['collectivite', 'prive', 'association'] as const
const TypeProtectionValues = ['classe', 'inscrit', 'spr', 'label_fdp', 'non_protege'] as const

export const ReglesCumulSchema = z.object({
  plafond_financement_public: z.number().optional(),
  cumulable_avec: z.array(z.string()).optional(),
  non_cumulable_avec: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export const AideSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  organisme: z.string().min(1, "L'organisme est requis"),
  type_aide: z.enum(TypeAideValues),
  source: z.enum(SourceAideValues),
  categorie: z.enum(CategorieAideValues),
  region_eligible: z.string().nullable().optional(),
  departement_eligible: z.string().nullable().optional(),
  statut_juridique_eligible: z.array(z.enum(StatutJuridiqueValues)),
  type_monument_eligible: z.array(z.enum(TypeProtectionValues)),
  type_travaux_eligible: z.array(z.string()),
  date_depot_debut: z.string().nullable().optional(),
  date_depot_fin: z.string().nullable().optional(),
  montant_max: z.number().positive().nullable().optional(),
  taux_max: z.number().min(0).max(1).nullable().optional(),
  plafond_financement_public: z.number().min(0).max(1).nullable().optional(),
  regles_cumul: ReglesCumulSchema.nullable().optional(),
  url_source: z.string().url("L'URL source doit être valide"),
  external_id: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
})

export type AideInput = z.infer<typeof AideSchema>
