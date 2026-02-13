import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm text-gray-500">
          © {year} PatriAlta. Diagnostic indicatif — non contractuel.
        </span>
        <nav className="flex items-center gap-5 text-xs text-gray-400">
          <Link href="/legal/cgu" className="hover:text-gray-700 transition-colors">
            CGU
          </Link>
          <Link href="/legal/mentions-legales" className="hover:text-gray-700 transition-colors">
            Mentions légales
          </Link>
          <Link href="/legal/confidentialite" className="hover:text-gray-700 transition-colors">
            Confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  )
}
