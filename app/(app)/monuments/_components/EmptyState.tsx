import Link from 'next/link'

export default function EmptyState() {
  return (
    <div className="text-center py-16 px-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
      <div className="text-4xl mb-4">🏛️</div>
      <h2 className="text-base font-semibold text-gray-900 mb-2">
        Vous n&apos;avez pas encore de monument
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Ajoutez votre premier monument pour découvrir les aides financières auxquelles
        vous êtes éligible et commencer à monter vos dossiers.
      </p>
      <Link
        href="#monument-form"
        className="inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
      >
        Ajouter mon premier monument
      </Link>
    </div>
  )
}
