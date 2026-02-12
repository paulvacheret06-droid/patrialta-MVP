'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// TODO: ajouter validation Zod des entrées avant insertion

/** Crée un nouveau monument pour l'utilisateur connecté */
export async function createMonument(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const monument = {
    user_id: user.id,
    nom: formData.get('nom') as string,
    commune: formData.get('commune') as string,
    departement: formData.get('departement') as string,
    region: formData.get('region') as string,
    ref_merimee: (formData.get('ref_merimee') as string) || null,
    is_verified_merimee: formData.get('ref_merimee') ? true : false,
    type_protection: (formData.get('type_protection') as string) || null,
    epoque: (formData.get('epoque') as string) || null,
    usage_actuel: (formData.get('usage_actuel') as string) || null,
  }

  const { error } = await supabase.from('monuments').insert(monument)
  if (error) throw new Error(error.message)

  revalidatePath('/monuments')
}

/** Supprime un monument (ownership vérifié par RLS) */
export async function deleteMonument(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('monuments')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/monuments')
}
