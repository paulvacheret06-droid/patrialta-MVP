'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/actions/auth'
import type { LoginFormState } from '@/lib/validations/auth'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const initialState: LoginFormState = {}

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  return (
    <Card variant="elevated">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
        <p className="text-sm text-gray-500 mt-1">Accédez à votre espace PatriAlta</p>
      </div>

      <form action={formAction} className="space-y-5">
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

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

        <Input
          label="Adresse email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />

        <Input
          label="Mot de passe"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isPending}
          className="w-full"
        >
          {isPending ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Pas encore de compte ?{' '}
        <Link
          href="/signup"
          className="font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Créer un compte
        </Link>
      </p>
    </Card>
  )
}
