import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import DossierDocument from '@/components/pdf/DossierDocument'
import { generateDossierDocx } from '@/lib/s2/export-docx'
import { getTemplate } from '@/lib/templates/index'

// ⚠️ OBLIGATOIRE — @react-pdf/renderer incompatible avec Edge Runtime
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dossierId } = await params
  const format = request.nextUrl.searchParams.get('format') ?? 'pdf'

  if (format !== 'pdf' && format !== 'docx') {
    return NextResponse.json({ error: 'Format invalide. Utilisez pdf ou docx.' }, { status: 400 })
  }

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

  // Vérification JWT
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Chargement dossier + ownership
  const { data: dossier } = await supabase
    .from('dossiers')
    .select('id, monument_id, aide_id, contenu_genere, updated_at, user_id')
    .eq('id', dossierId)
    .eq('user_id', user.id)
    .single()

  if (!dossier) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
  }

  if (!dossier.contenu_genere) {
    return NextResponse.json(
      { error: 'Le dossier n\'a pas encore été généré.' },
      { status: 422 }
    )
  }

  // Monument + aide + documents
  const [{ data: monument }, { data: aide }, { data: documents }] = await Promise.all([
    supabase
      .from('monuments')
      .select('nom, commune, departement, type_protection')
      .eq('id', dossier.monument_id)
      .single(),
    supabase
      .from('aides')
      .select('nom, organisme_nom, organisme_id, date_depot_fin')
      .eq('id', dossier.aide_id)
      .single(),
    supabase
      .from('documents')
      .select('type_piece, nom_fichier, statut')
      .eq('dossier_id', dossierId),
  ])

  if (!monument || !aide) {
    return NextResponse.json({ error: 'Données introuvables' }, { status: 404 })
  }

  const template = getTemplate(aide.organisme_id ?? '')
  const sectionsContenu = dossier.contenu_genere as Record<
    string,
    { contenu: string; is_edite: boolean }
  >
  const docsArray = documents ?? []
  const generatedAt = dossier.updated_at ?? new Date().toISOString()

  const safeName = `${monument.nom.replace(/[^a-z0-9]/gi, '_')}_${aide.nom.replace(/[^a-z0-9]/gi, '_')}`

  if (format === 'pdf') {
    const element = React.createElement(DossierDocument, {
      monument,
      aide,
      template,
      sectionsContenu,
      documents: docsArray,
      generatedAt,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any)

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
      },
    })
  }

  // DOCX
  const buffer = await generateDossierDocx(
    monument,
    aide,
    template,
    sectionsContenu,
    docsArray,
    generatedAt
  )

  return new Response(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeName}.docx"`,
    },
  })
}
