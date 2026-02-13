'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signupAction } from '@/actions/auth'
import type { SignupFormState } from '@/lib/validations/auth'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const initialState: SignupFormState = {}

const inputClasses =
  'w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:border-[#0c5ce9]'

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState)

  return (
    <Card variant="elevated">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
        <p className="text-sm text-gray-500 mt-1">Rejoignez PatriAlta pour gérer vos monuments</p>
      </div>

      <form action={formAction} className="space-y-5">
        {state.error && (
          <div
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-error) 20%, transparent)',
              color: 'var(--color-error)',
            }}
          >
            {state.error}
          </div>
        )}

        {/* ── Section 1 — Identifiants ── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Vos identifiants
          </h2>
          <div className="space-y-4">
            <Input
              label="Adresse email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mot de passe{' '}
                <span className="font-normal text-gray-400">(8 caractères minimum)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClasses}
                style={{ focusRingColor: 'var(--color-secondary)' } as React.CSSProperties}
              />
            </div>
          </div>
        </div>

        {/* ── Séparateur ── */}
        <hr className="border-gray-100" />

        {/* ── Section 2 — Profil ── */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Votre profil
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="statut_juridique" className="text-sm font-medium text-gray-700">
                Vous êtes…
                <span className="text-[#ef4444] ml-0.5" aria-hidden="true">*</span>
              </label>
              <select
                id="statut_juridique"
                name="statut_juridique"
                required
                className={inputClasses}
              >
                <option value="">Sélectionner…</option>
                <option value="collectivite">Une collectivité (commune, EPCI…)</option>
                <option value="prive">Un propriétaire privé</option>
                <option value="association">Une association</option>
              </select>
            </div>

            <Input
              label="Commune ou département"
              id="commune"
              name="commune"
              type="text"
              placeholder="Ex : Lyon, Aube (10)…"
              required
            />
          </div>
        </div>

        {/* ── Consentement RGPD ── */}
        <div className="flex items-start gap-3">
          <input
            id="rgpd_accepted"
            name="rgpd_accepted"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
            style={{ accentColor: 'var(--color-secondary)' }}
          />
          <label htmlFor="rgpd_accepted" className="text-xs text-gray-500 leading-relaxed">
            J&apos;ai lu et j&apos;accepte les{' '}
            <a
              href="/legal/cgu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              CGU
            </a>{' '}
            et la{' '}
            <a
              href="/legal/confidentialite"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              politique de confidentialité
            </a>
            .
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isPending}
          className="w-full"
        >
          {isPending ? 'Création du compte…' : 'Créer mon compte'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Se connecter
        </Link>
      </p>
    </Card>
  )
}
