import Link from 'next/link'

export default function EmptyState() {
  return (
    <div className="text-center py-16 px-6 bg-white border border-dashed border-gray-200 rounded-xl">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-8 h-8 text-gray-400"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
          />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucun monument ajouté</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
        Commencez par ajouter votre premier monument pour découvrir les aides disponibles.
      </p>

      <Link
        href="#monument-form"
        className="inline-flex items-center gap-1.5 font-medium px-5 py-2.5 text-sm text-white rounded-lg transition-colors"
        style={{
          background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary))',
        }}
      >
        Ajouter mon premier monument
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  )
}
