import type { StatutJuridique } from '@/lib/s1/types'

export interface Profile {
  id: string
  user_id: string
  statut_juridique: StatutJuridique | null
  commune: string | null
  region: string | null
  nom_commune_officielle: string | null
  code_commune_insee: string | null
  siren: string | null
  telephone: string | null
  rgpd_consent_at: string | null
  created_at: string
}
