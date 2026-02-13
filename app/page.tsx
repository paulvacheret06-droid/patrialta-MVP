import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Footer from '@/components/layout/Footer'

const PILLARS: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: 'Exhaustivité transversale',
    desc: 'Toutes les aides en un seul endroit : État/DRAC, régions, départements, fondations privées et Europe.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-10.498 4.875 2.437c.381.19.622.58.622 1.006v4.114c0 .754-.753 1.258-1.447.96l-4.796-2.132a1.5 1.5 0 0 0-1.214 0l-4.796 2.132C7.753 18.372 7 17.868 7 17.114v-4.114c0-.426.241-.815.622-1.006l4.875-2.437a1.125 1.125 0 0 1 1.006 0Z" />
      </svg>
    ),
  },
  {
    title: 'Proactivité',
    desc: "PatriAlta vous alerte quand une aide s'ouvre pour votre monument. Aucune opportunité manquée.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
  },
  {
    title: 'Accessibilité sans expertise',
    desc: 'Le mille-feuille des aides patrimoine traduit en critères factuels clairs et actionnables.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    title: 'Continuité diagnostic → montage',
    desc: 'Les données saisies pour le diagnostic pré-remplissent directement le dossier. Zéro ressaisie.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/monuments')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 border-b border-gray-200 shadow-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(24px)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
            PatriAlta
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center font-medium rounded-lg text-white shadow-sm px-3 py-1.5 text-xs transition-all"
              style={{
                background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
              }}
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="text-center py-20 sm:py-28 px-4"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, #eff6ff 0%, white 100%)',
          }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-gray-200 bg-white px-4 py-1.5 rounded-full text-sm text-gray-600 mb-8 shadow-sm">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--color-success)' }}
              />
              Régions pilotes : Auvergne-Rhône-Alpes · Aube
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
              De votre monument à votre{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                }}
              >
                dossier de subvention
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              PatriAlta identifie les aides financières auxquelles votre monument est éligible
              et vous guide pour monter vos dossiers — sans consultant, en quelques minutes.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center font-medium rounded-lg text-white shadow-sm px-6 py-3.5 text-base transition-all"
                style={{
                  background:
                    'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                }}
              >
                Commencer gratuitement
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center font-medium rounded-lg border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 px-6 py-3.5 text-base transition-all"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </section>

        {/* ── Comment ça marche ── */}
        <section className="bg-white py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-secondary)' }}
              >
                Simple et rapide
              </p>
              <h2 className="text-3xl font-bold text-gray-900">Comment ça marche</h2>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Ligne pointillée desktop */}
              <div
                className="hidden md:block absolute top-5 border-t-2 border-dashed border-gray-200"
                style={{ left: 'calc(100% / 6)', right: 'calc(100% / 6)' }}
              />

              {[
                {
                  n: 1,
                  title: 'Ajoutez votre monument',
                  desc: 'Recherchez dans la base Mérimée ou saisissez manuellement.',
                },
                {
                  n: 2,
                  title: 'Découvrez vos aides',
                  desc: "L'algorithme croise les critères de votre monument avec 30+ programmes.",
                },
                {
                  n: 3,
                  title: 'Montez votre dossier',
                  desc: 'Le contenu est pré-rempli. Vous relisez, ajustez, et déposez.',
                },
              ].map((step) => (
                <div key={step.n} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-5 shrink-0"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    {step.n}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Piliers de valeur ── */}
        <section className="bg-gray-50 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p
                className="text-sm font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-secondary)' }}
              >
                Pourquoi PatriAlta
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                La plateforme qui simplifie l&apos;accès aux subventions patrimoine
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PILLARS.map((pillar) => (
                <Card
                  key={pillar.title}
                  variant="interactive"
                  className="group relative overflow-hidden"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                      color: 'var(--color-secondary)',
                    }}
                  >
                    {pillar.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{pillar.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{pillar.desc}</p>
                  {/* Barre d'accent au survol */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
                    }}
                  />
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section
          className="py-16 sm:py-20 px-4"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Prêt à simplifier vos subventions ?
            </h2>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Créez votre compte en 30 secondes.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-white font-semibold px-6 py-3.5 rounded-lg text-base hover:bg-gray-50 transition-colors"
              style={{ color: 'var(--color-primary)' }}
            >
              Commencer gratuitement
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
