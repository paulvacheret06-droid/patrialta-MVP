import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
})

export const SignupSchema = z.object({
  email: z.string().email('Adresse email invalide.'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
  statut_juridique: z.enum(['collectivite', 'prive', 'association'], {
    required_error: 'Veuillez sélectionner un statut juridique.',
    invalid_type_error: 'Statut juridique invalide.',
  }),
  commune: z.string().min(1, 'Veuillez renseigner votre commune ou département.'),
})

export type LoginFormState = {
  error?: string
}

export type SignupFormState = {
  error?: string
}
