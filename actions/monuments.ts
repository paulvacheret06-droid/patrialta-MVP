'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CreateMonumentSchema, UpdateMonumentProjetSchema, type MonumentFormState } from '@/lib/validations/monuments'

export async function createMonument(
  _prevState: MonumentFormState,
  formData: FormData
): Promise<MonumentFormState> {
  const raw = {
    nom: formData.get('nom') as string,
    commune: formData.get('commune') as string,
    departement: formData.get('departement') as string,
    region: formData.get('region') as string,
    ref_merimee: formData.get('ref_merimee') as string,
    type_protection: formData.get('type_protection') as string | undefined,
    epoque: formData.get('epoque') as string,
    usage_actuel: formData.get('usage_actuel') as string,
  }

  const parsed = CreateMonumentSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: MonumentFormState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<MonumentFormState['errors']>
      if (!errors[field]) errors[field] = []
      errors[field]!.push(issue.message)
    }
    return { errors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { errors: { _form: ['Non authentifié.'] } }

  const { error } = await supabase.from('monuments').insert({
    user_id: user.id,
    nom: parsed.data.nom,
    commune: parsed.data.commune,
    departement: parsed.data.departement,
    region: parsed.data.region,
    ref_merimee: parsed.data.ref_merimee ?? null,
    is_verified_merimee: !!parsed.data.ref_merimee,
    type_protection: parsed.data.type_protection ?? null,
    epoque: parsed.data.epoque ?? null,
    usage_actuel: parsed.data.usage_actuel ?? null,
  })

  if (error) {
    return { errors: { _form: ['Erreur lors de la création du monument.'] } }
  }

  revalidatePath('/monuments')
  return { success: true }
}

export async function deleteMonument(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('monuments').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/monuments')
}

export type ProjetFormState = {
  errors?: {
    description_projet?: string[]
    type_travaux?: string[]
    budget_estime?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function updateMonumentProjet(
  monumentId: string,
  _prevState: ProjetFormState,
  formData: FormData
): Promise<ProjetFormState> {
  const raw = {
    description_projet: formData.get('description_projet') as string | null,
    type_travaux: formData.getAll('type_travaux') as string[],
    budget_estime: formData.get('budget_estime') ? Number(formData.get('budget_estime')) : null,
  }

  const parsed = UpdateMonumentProjetSchema.safeParse(raw)
  if (!parsed.success) {
    const errors: ProjetFormState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<ProjetFormState['errors']>
      if (!errors[field]) errors[field] = []
      errors[field]!.push(issue.message)
    }
    return { errors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { errors: { _form: ['Non authentifié.'] } }

  const { error } = await supabase
    .from('monuments')
    .update({
      description_projet: parsed.data.description_projet ?? null,
      type_travaux: parsed.data.type_travaux.length > 0 ? parsed.data.type_travaux : [],
      budget_estime: parsed.data.budget_estime ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', monumentId)
    .eq('user_id', user.id)

  if (error) {
    return { errors: { _form: ['Erreur lors de la mise à jour du projet.'] } }
  }

  revalidatePath(`/monuments`)
  revalidatePath(`/monuments/${monumentId}/aides`)
  return { success: true }
}
