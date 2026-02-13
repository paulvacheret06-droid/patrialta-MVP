'use server'

import { createClient } from '@/lib/supabase/server'

export async function dismissAlert(
  alertId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Non authentifié.' }

  // RLS garantit que seul le propriétaire peut modifier son alerte
  const { error } = await supabase
    .from('alerts')
    .update({ statut: 'dismissed', updated_at: new Date().toISOString() })
    .eq('id', alertId)

  if (error) return { error: 'Erreur lors de la suppression de l\'alerte.' }

  return { success: true }
}
