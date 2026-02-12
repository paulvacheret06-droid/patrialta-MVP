'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAction } from '@/actions/auth'
import type { SignupFormState } from '@/lib/validations/auth'

const initialState: SignupFormState = {}

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Créer un compte</h1>
        <p className="text-sm text-gray-500 mt-1">Rejoignez PatriAlta pour gérer vos monuments</p>
      </div>

      <form action={formAction} className="space-y-5">
        {state.error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Section 1 — Identifiants */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Vos identifiants</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
                Mot de passe <span className="text-gray-400">(8 caractères minimum)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <hr className="border-gray-100" />

        {/* Section 2 — Profil */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Votre profil</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="statut_juridique" className="block text-sm text-gray-600 mb-1">
                Vous êtes…
              </label>
              <select
                id="statut_juridique"
                name="statut_juridique"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Sélectionner…</option>
                <option value="collectivite">Une collectivité (commune, EPCI…)</option>
                <option value="prive">Un propriétaire privé</option>
                <option value="association">Une association</option>
              </select>
            </div>
            <div>
              <label htmlFor="commune" className="block text-sm text-gray-600 mb-1">
                Commune ou département
              </label>
              <input
                id="commune"
                name="commune"
                type="text"
                placeholder="Ex : Lyon, Aube (10)…"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Création du compte…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
