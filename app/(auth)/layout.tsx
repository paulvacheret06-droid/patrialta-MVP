import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/monuments')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── Colonne gauche — décoration (desktop uniquement) ── */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {/* Motif de points en CSS pur */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Halo décoratif */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: 'var(--color-secondary)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: 'var(--color-secondary-light)' }}
        />

        {/* Contenu */}
        <div className="relative z-10 max-w-sm text-center">
          <span className="block text-4xl font-bold text-white tracking-tight mb-6">
            PatriAlta
          </span>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Identifiez les aides financières de votre monument et montez vos dossiers de
            subvention — sans consultant.
          </p>

          {/* Points de réassurance */}
          <div className="flex flex-col gap-3 text-left">
            {[
              '30+ programmes de financement référencés',
              'Auvergne-Rhône-Alpes · Aube',
              'Dossiers pré-remplis en quelques minutes',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/80">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-success)' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3 h-3" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Colonne droite — formulaire ── */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 sm:p-8">
        {/* Logo mobile uniquement */}
        <div className="md:hidden mb-8">
          <span
            className="text-2xl font-bold"
            style={{ color: 'var(--color-primary)' }}
          >
            PatriAlta
          </span>
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
