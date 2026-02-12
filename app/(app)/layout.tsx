import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/actions/auth'

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
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-sm text-gray-900">PatriAlta</span>
          {user && (
            <nav className="flex items-center gap-1">
              <Link
                href="/monuments"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Monuments
              </Link>
              <Link
                href="/aides"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Aides
              </Link>
              <Link
                href="/dossiers"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Dossiers
              </Link>
            </nav>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Déconnexion
              </button>
            </form>
          </div>
        )}
      </header>

      {user && !profile && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-sm text-amber-800">
          Complétez votre profil pour accéder à toutes les fonctionnalités.
        </div>
      )}

      <main>{children}</main>
    </div>
  )
}
