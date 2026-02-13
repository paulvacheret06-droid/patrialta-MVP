import { NextRequest, NextResponse } from 'next/server'
import { fetchAidesPatrimoine } from '@/lib/aides-territoires/client'
import { runSync } from '@/lib/aides-territoires/sync'

// Appelée uniquement par Vercel Cron — protégée par CRON_SECRET
export async function GET(request: NextRequest) {
  return handleSync(request)
}

export async function POST(request: NextRequest) {
  return handleSync(request)
}

async function handleSync(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Récupérer toutes les aides patrimoine
    const aides = await fetchAidesPatrimoine()

    if (aides.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'Aucune aide récupérée depuis Aides-territoires.',
        report: { inserted: 0, updated: 0, skipped: 0, marked_inactive: 0, errors: [], alert_sent: false },
      })
    }

    // 2. Sync (upsert + mark inactive + alerte si taux erreur > 20%)
    const report = await runSync(aides)

    return NextResponse.json({
      ok: true,
      fetched: aides.length,
      report,
    })
  } catch (err) {
    const error = err as Error

    // Alerte email en cas d'erreur globale
    try {
      const apiKey = process.env.BREVO_API_KEY
      if (apiKey) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: { name: 'PatriAlta Sync', email: 'noreply@patri-alta.fr' },
            to: [{ email: process.env.ALERT_EMAIL ?? 'admin@patri-alta.fr' }],
            subject: '[PatriAlta] Erreur critique sync Aides-territoires',
            textContent: `Erreur : ${error.message}\n\nStack : ${error.stack ?? ''}`,
          }),
        })
      }
    } catch {
      // Erreur lors de l'envoi de l'alerte — on continue
    }

    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }
}
