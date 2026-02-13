'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '@/components/ui/Button'

interface AppHeaderProps {
  user: { email: string }
  logoutAction: (formData: FormData) => Promise<void>
}

const NAV_LINKS = [
  { href: '/monuments', label: 'Monuments' },
  { href: '/aides', label: 'Aides' },
  { href: '/dossiers', label: 'Dossiers' },
]

export default function AppHeader({ user, logoutAction }: AppHeaderProps) {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-200 shadow-sm"
      style={{ backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo + nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/monuments"
            className="text-xl font-bold shrink-0"
            style={{ color: 'var(--color-primary)' }}
          >
            PatriAlta
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    !isActive && 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={
                    isActive
                      ? {
                          backgroundColor: 'rgba(8, 26, 75, 0.08)',
                          color: 'var(--color-primary)',
                        }
                      : undefined
                  }
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Email + logout */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm font-medium text-gray-500">{user.email}</span>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Déconnexion
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
