'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  LoginSchema,
  SignupSchema,
  type LoginFormState,
  type SignupFormState,
} from '@/lib/validations/auth'

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  const redirectTo = (formData.get('redirect') as string) || '/monuments'
  redirect(redirectTo)
}

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    statut_juridique: formData.get('statut_juridique') as string,
    commune: formData.get('commune') as string,
    rgpd_accepted: formData.get('rgpd_accepted') === 'on' ? 'true' : '',
  }

  const parsed = SignupSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Cet email est déjà utilisé ou une erreur est survenue.' }
  }

  if (!data.user) {
    return { error: 'Une erreur est survenue lors de la création du compte.' }
  }

  // Création du profil — indépendante de l'erreur auth
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: data.user.id,
    statut_juridique: parsed.data.statut_juridique,
    commune: parsed.data.commune,
    rgpd_consent_at: new Date().toISOString(),
  })

  if (profileError) {
    // Ne pas bloquer la connexion — le profil peut être complété plus tard
    console.error('[signupAction] Échec création profil:', profileError.message)
  }

  redirect('/monuments')
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
