import { NextRequest, NextResponse } from 'next/server'

// Appelée uniquement par Vercel Cron — protégée par CRON_SECRET
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: implémenter la synchronisation Aides-territoires (S1 — Mouline)
  // 1. Appeler l'API Aides-territoires avec filtre thématique patrimoine
  // 2. Valider chaque objet avec Zod
  // 3. Diff : ne mettre à jour que les aides modifiées
  // 4. Mettre à jour last_synced_at pour toutes les aides
  // 5. En cas d'erreur : envoyer email Brevo à l'admin

  return NextResponse.json({ ok: true, message: 'Sync scheduled — not yet implemented' })
}
