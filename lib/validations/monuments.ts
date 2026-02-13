import { z } from 'zod'

const typeProtectionValues = ['classe', 'inscrit', 'spr', 'label_fdp', 'non_protege'] as const

export const CreateMonumentSchema = z.object({
  nom: z.string().min(1, 'Le nom du monument est requis.'),
  commune: z.string().min(1, 'La commune est requise.'),
  departement: z.string().min(1, 'Le département est requis.'),
  region: z.string().min(1, 'La région est requise.'),
  ref_merimee: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.string().nullable()
  ),
  type_protection: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : v),
    z.enum(typeProtectionValues).nullable()
  ),
  epoque: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.string().nullable()
  ),
  usage_actuel: z.preprocess(
    (v) => (v === '' || v === undefined ? null : v),
    z.string().nullable()
  ),
})

export type MonumentFormState = {
  errors?: {
    nom?: string[]
    commune?: string[]
    departement?: string[]
    region?: string[]
    _form?: string[]
  }
  success?: boolean
}

const typeTravauxValues = [
  'conservation',
  'restauration',
  'accessibilite',
  'etudes',
  'valorisation',
  'urgence',
] as const

export const UpdateMonumentProjetSchema = z.object({
  description_projet: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : v),
    z.string().max(2000).nullable()
  ),
  type_travaux: z.array(z.enum(typeTravauxValues)).default([]),
  budget_estime: z.preprocess(
    (v) => (v === null || v === undefined || v === '' ? null : Number(v)),
    z.number().positive('Le budget doit être un nombre positif.').nullable()
  ),
})
