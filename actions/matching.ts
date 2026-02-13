'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'
import { evaluerEligibilites } from '@/lib/s1/engine'
import type { Aide, Monument, ResultatEligibilite } from '@/lib/s1/types'

export async function runMatching(monumentId: string): Promise<ResultatEligibilite[]> {
  const supabase = await createClient()

  // Vérification authentification
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // Lecture monument (RLS garantit l'ownership)
  const { data: monument, error: monumentError } = await supabase
    .from('monuments')
    .select('*')
    .eq('id', monumentId)
    .single()

  if (monumentError || !monument) {
    throw new Error('Monument introuvable ou accès refusé')
  }

  // Lecture de toutes les aides actives (lecture publique)
  const { data: aides, error: aidesError } = await supabase
    .from('aides')
    .select('*')
    .eq('is_active', true)

  if (aidesError || !aides) {
    throw new Error('Erreur lors de la récupération des aides')
  }

  // Mode projet : si type_travaux est renseigné, filtrer les aides par type_travaux_eligible
  const m = monument as Monument
  const aidesFiltered = m.type_travaux && m.type_travaux.length > 0
    ? (aides as Aide[]).filter((a) => {
        if (!a.type_travaux_eligible || a.type_travaux_eligible.length === 0) return true
        return m.type_travaux!.some((t) => a.type_travaux_eligible.includes(t))
      })
    : (aides as Aide[])

  // Calcul matching — pur TypeScript, zéro LLM
  const results = evaluerEligibilites(m, aidesFiltered)

  // Persistance des résultats via service_role (contourne l'absence de policy UPDATE sur eligibility_results)
  // Sécurité : l'ownership a déjà été vérifié par RLS ci-dessus via le client authentifié
  const serviceClient = createServiceClient()
  const toUpsert = results.map((r) => ({
    monument_id: r.monument_id,
    aide_id: r.aide_id,
    criteres_remplis: r.criteres_remplis,
    criteres_manquants: r.criteres_manquants,
    criteres_a_verifier: r.criteres_a_verifier,
    computed_at: new Date().toISOString(),
  }))

  const { error: upsertError } = await serviceClient
    .from('eligibility_results')
    .upsert(toUpsert, { onConflict: 'monument_id,aide_id' })

  if (upsertError) {
    throw new Error(`Erreur lors de la persistance des résultats : ${upsertError.message}`)
  }

  revalidatePath(`/monuments/${monumentId}/aides`)
  return results
}
