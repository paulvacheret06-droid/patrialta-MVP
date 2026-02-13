import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { getTemplate } from '@/lib/templates/index'
import { checkRateLimit } from '@/lib/s2/rate-limit'
import { buildSectionPrompt, buildSystemPrompt } from '@/lib/s2/prompt-builder'

// ⚠️ OBLIGATOIRE — @anthropic-ai/sdk streaming incompatible avec Edge Runtime
export const runtime = 'nodejs'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ────────────────────────────────────────────────────────────────────────────
// Helpers SSE
// ────────────────────────────────────────────────────────────────────────────

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

// ────────────────────────────────────────────────────────────────────────────
// Génération d'une section avec retry exponentiel
// ────────────────────────────────────────────────────────────────────────────

async function generateSection(
  prompt: string,
  systemPrompt: string,
  onChunk: (text: string) => void,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      // Backoff exponentiel : 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
    }

    try {
      let fullContent = ''

      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      })

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const text = event.delta.text
          fullContent += text
          onChunk(text)
        }
      }

      return fullContent
    } catch (err) {
      const error = err as { status?: number; message?: string }
      // Retry seulement sur 429 (rate limit Anthropic), 500, 529 (overloaded)
      if (error.status === 429 || error.status === 500 || error.status === 529) {
        lastError = err as Error
        continue
      }
      throw err
    }
  }

  throw lastError ?? new Error('Génération échouée après plusieurs tentatives.')
}

// ────────────────────────────────────────────────────────────────────────────
// Route POST
// ────────────────────────────────────────────────────────────────────────────

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
    return new Response(
      sseEvent('error', { message: 'Non authentifié' }),
      { status: 401, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  // 2. Rate limiting
  const rateCheck = checkRateLimit(user.id)
  if (!rateCheck.allowed) {
    return new Response(
      sseEvent('error', {
        message: 'Limite de génération atteinte (10/heure). Réessayez plus tard.',
        resetAt: rateCheck.resetAt?.toISOString(),
      }),
      { status: 429, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  const body = await request.json()
  const { dossierId } = body as { dossierId: string }

  // 3. Vérification ownership + chargement dossier
  const { data: dossier } = await supabase
    .from('dossiers')
    .select('id, monument_id, aide_id, user_id')
    .eq('id', dossierId)
    .eq('user_id', user.id)
    .single()

  if (!dossier) {
    return new Response(
      sseEvent('error', { message: 'Dossier introuvable' }),
      { status: 404, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  // 4. Charger monument + aide + eligibility
  const [{ data: monument }, { data: aide }, { data: eligibility }] = await Promise.all([
    supabase
      .from('monuments')
      .select('nom, commune, departement, region, type_monument, type_protection, description_projet, type_travaux, budget_estime')
      .eq('id', dossier.monument_id)
      .single(),
    supabase
      .from('aides')
      .select('nom, organisme_nom, organisme_id, description, montant_max, taux_max, date_depot_fin')
      .eq('id', dossier.aide_id)
      .single(),
    supabase
      .from('eligibility_results')
      .select('criteres_remplis, criteres_a_verifier')
      .eq('monument_id', dossier.monument_id)
      .eq('aide_id', dossier.aide_id)
      .single(),
  ])

  if (!monument || !aide || !eligibility) {
    return new Response(
      sseEvent('error', { message: 'Données introuvables pour ce dossier' }),
      { status: 404, headers: { 'Content-Type': 'text/event-stream' } }
    )
  }

  // 5. Charger le template selon l'organisme
  const template = getTemplate(aide.organisme_id ?? '')

  // 6. Mettre le dossier en_cours
  await supabase
    .from('dossiers')
    .update({ statut: 'en_cours', updated_at: new Date().toISOString() })
    .eq('id', dossierId)

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Stream SSE : générer chaque section
  // ──────────────────────────────────────────────────────────────────────────

  const systemPrompt = buildSystemPrompt()
  const contenuGenere: Record<string, { contenu: string; is_edite: boolean }> = {}

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEvent(event, data)))
      }

      try {
        for (const section of template.sections) {
          send('section_start', { sectionId: section.id, titre: section.titre })

          const prompt = buildSectionPrompt({
            monument: monument as Parameters<typeof buildSectionPrompt>[0]['monument'],
            aide: aide as Parameters<typeof buildSectionPrompt>[0]['aide'],
            eligibility: eligibility as Parameters<typeof buildSectionPrompt>[0]['eligibility'],
            template,
            sectionId: section.id,
          })

          let sectionContent = ''

          sectionContent = await generateSection(
            prompt,
            systemPrompt,
            (chunk) => {
              send('chunk', { sectionId: section.id, text: chunk })
            }
          )

          contenuGenere[section.id] = { contenu: sectionContent, is_edite: false }

          // Sauvegarde progressive après chaque section
          await supabase
            .from('dossiers')
            .update({
              contenu_genere: contenuGenere,
              updated_at: new Date().toISOString(),
            })
            .eq('id', dossierId)

          send('section_end', { sectionId: section.id })
        }

        // Finaliser le statut
        await supabase
          .from('dossiers')
          .update({ statut: 'brouillon', updated_at: new Date().toISOString() })
          .eq('id', dossierId)

        send('done', { dossierId })
      } catch (err) {
        const error = err as Error
        send('error', { message: error.message ?? 'Erreur lors de la génération' })

        // Remettre en brouillon si erreur
        await supabase
          .from('dossiers')
          .update({ statut: 'brouillon', updated_at: new Date().toISOString() })
          .eq('id', dossierId)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
