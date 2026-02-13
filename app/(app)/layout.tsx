import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/actions/auth'
import AppHeader from '@/components/layout/AppHeader'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('statut_juridique')
        .eq('user_id', user.id)
        .single()
    : { data: null }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <AppHeader
          user={{ email: user.email ?? '' }}
          logoutAction={logoutAction}
        />
      )}

      {user && !profile && (
        <div
          className="border-b px-6 py-3"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-warning) 8%, white)',
            borderColor: 'color-mix(in srgb, var(--color-warning) 25%, transparent)',
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-warning) 18%, white)',
                color: 'var(--color-warning)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>
            <p className="text-sm" style={{ color: '#92400e' }}>
              Complétez votre profil pour accéder à toutes les fonctionnalités.{' '}
              <Link
                href="/monuments"
                className="font-semibold underline hover:no-underline"
              >
                Continuer
              </Link>
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
