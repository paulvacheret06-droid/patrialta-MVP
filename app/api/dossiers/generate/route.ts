import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ⚠️ OBLIGATOIRE — @react-pdf/renderer est incompatible avec Edge Runtime
export const runtime = 'nodejs'

// Rate limiting simple en mémoire (à remplacer par Upstash Redis en production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 heure
  const limit = 10

  const record = rateLimitMap.get(userId)
  if (!record || record.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) return false
  record.count++
  return true
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Vérification JWT
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // 2. Rate limiting : 10 générations/heure par user_id
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: 'Limite de génération atteinte (10/heure). Réessayez plus tard.' },
      { status: 429 }
    )
  }

  const body = await request.json()
  const { dossierId } = body as { dossierId: string }

  // 3. Vérification ownership
  const { data: dossier, error: dossierError } = await supabase
    .from('dossiers')
    .select('id, monument_id, aide_id, user_id')
    .eq('id', dossierId)
    .eq('user_id', user.id)
    .single()

  if (dossierError || !dossier) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  // TODO: implémenter la génération streaming SSE via Claude API (S2 — Montage)
  // 1. Récupérer les données monument + aide
  // 2. Charger le template TypeScript correspondant à l'organisme
  // 3. Streamer la réponse Claude avec retry (3 tentatives, backoff exponentiel)
  // 4. Sauvegarder contenu_genere en chunks dans la table dossiers

  return NextResponse.json({ ok: true, message: 'Generation not yet implemented' })
}
