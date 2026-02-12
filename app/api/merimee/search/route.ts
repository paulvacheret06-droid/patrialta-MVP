import { NextRequest, NextResponse } from 'next/server'

const MERIMEE_BASE_URL = 'https://api.pop.culture.gouv.fr/maison/merimee'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: 'Requête trop courte' }, { status: 400 })
  }

  try {
    const url = `${MERIMEE_BASE_URL}?q=${encodeURIComponent(q)}&field=titre,commune,departement,region,typeProtection,refMerimee&size=10`
    const response = await fetch(url, {
      // Cache 24h — Next.js fetch natif
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      // Fallback gracieux — ne jamais retourner 500 à l'utilisateur
      return NextResponse.json(
        {
          results: [],
          fallback: true,
          message: 'Autocomplétion temporairement indisponible, utilisez la saisie manuelle.',
        },
        { status: 200 }
      )
    }

    const data = await response.json()
    return NextResponse.json({ results: data.hits?.hits ?? [] })
  } catch {
    return NextResponse.json(
      {
        results: [],
        fallback: true,
        message: 'Autocomplétion temporairement indisponible, utilisez la saisie manuelle.',
      },
      { status: 200 }
    )
  }
}
