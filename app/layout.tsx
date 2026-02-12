import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PatriAlta — Aides financières pour monuments historiques',
  description:
    'Identifiez les aides financières auxquelles votre monument est éligible et montez vos dossiers de subvention.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
