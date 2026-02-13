import { z } from 'zod'

/**
 * Schema Zod pour valider les objets retournés par l'API Aides-territoires.
 * Chaque objet invalide est ignoré (loggé) sans crasher la sync entière.
 */
export const AideTerritorieSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  name_initial: z.string().optional(),
  description: z.string().optional().default(''),
  financers: z.array(z.string()).optional().default([]),
  aid_types: z.array(z.string()).optional().default([]),
  url: z.string().url().optional(),
  origin_url: z.string().url().optional(),
  is_call_for_project: z.boolean().optional().default(false),
  start_date: z.string().nullable().optional(),
  submission_deadline: z.string().nullable().optional(),
  perimeter: z.string().optional(),
  categories: z.array(z.string()).optional().default([]),
  programs: z.array(z.string()).optional().default([]),
  targeted_audiances: z.array(z.string()).optional().default([]),
  is_live: z.boolean().optional().default(true),
})

export type AideTerritorie = z.infer<typeof AideTerritorieSchema>
