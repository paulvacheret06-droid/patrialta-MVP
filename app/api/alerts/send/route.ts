import { NextRequest, NextResponse } from 'next/server'
import { createDeadlineAlerts } from '@/lib/alerts/create-deadline-alerts'
import { sendPendingAlerts } from '@/lib/alerts/send-alerts'

// Appelée uniquement par Vercel Cron — protégée par CRON_SECRET
export async function GET(request: NextRequest) {
  return handleSend(request)
}

export async function POST(request: NextRequest) {
  return handleSend(request)
}

async function handleSend(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Créer les alertes deadline proches
    const deadlineAlertsCreated = await createDeadlineAlerts()

    // 2. Envoyer les alertes pending
    const { sent, failed } = await sendPendingAlerts()

    return NextResponse.json({
      ok: true,
      report: {
        deadline_alerts_created: deadlineAlertsCreated,
        emails_sent: sent,
        emails_failed: failed,
      },
    })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
