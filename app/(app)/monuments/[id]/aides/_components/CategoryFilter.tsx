'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CATEGORIE_LABELS: Record<string, string> = {
  conservation: 'Conservation',
  restauration: 'Restauration',
  accessibilite: 'Accessibilité',
  etudes: 'Études',
  valorisation: 'Valorisation',
  urgence: 'Urgence',
}

interface CategoryFilterProps {
  categories: string[]
  current?: string
}

export default function CategoryFilter({ categories, current }: CategoryFilterProps) {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Link
        href={pathname}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          !current
            ? 'bg-gray-900 text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        Toutes
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat}
          href={`${pathname}?categorie=${cat}`}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            current === cat
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {CATEGORIE_LABELS[cat] ?? cat}
        </Link>
      ))}
    </div>
  )
}
