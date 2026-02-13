import Link from 'next/link'

export default function Hero() {
  return (
    <div className="text-center max-w-3xl mx-auto px-4 py-20">
      <div className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
        Régions pilotes : Auvergne-Rhône-Alpes · Aube
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
        De votre monument à votre{' '}
        <span className="text-gray-600">dossier de subvention</span>
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
        PatriAlta identifie les aides financières auxquelles votre monument est éligible
        et vous guide pour monter vos dossiers — sans consultant, en quelques minutes.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          Commencer gratuitement
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </div>
  )
}
