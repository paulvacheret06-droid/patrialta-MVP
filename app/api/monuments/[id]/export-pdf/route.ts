import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import AidesSyntheseDocument from '@/components/pdf/AidesSyntheseDocument'
import type { Aide, CritereResult } from '@/lib/s1/types'

// ⚠️ OBLIGATOIRE — @react-pdf/renderer est incompatible avec Edge Runtime
export const runtime = 'nodejs'

type AideResultRow = {
  aide_id: string
  criteres_remplis: CritereResult[]
  criteres_manquants: CritereResult[]
  criteres_a_verifier: CritereResult[]
  aide: Aide
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: monumentId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Vérification ownership via RLS
  const { data: monument } = await supabase
    .from('monuments')
    .select('id, nom, commune, departement, region, type_protection')
    .eq('id', monumentId)
    .single()

  if (!monument) return NextResponse.json({ error: 'Monument introuvable' }, { status: 404 })

  // Chargement des résultats d'éligibilité
  const { data: rows } = await supabase
    .from('eligibility_results')
    .select('aide_id, criteres_remplis, criteres_manquants, criteres_a_verifier, aide:aides(*)')
    .eq('monument_id', monumentId)

  const results = ((rows ?? []) as unknown as AideResultRow[]).map((r) => ({
    aide: r.aide,
    criteres_remplis: r.criteres_remplis,
    criteres_manquants: r.criteres_manquants,
    criteres_a_verifier: r.criteres_a_verifier,
  }))

  // Génération du PDF
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    createElement(AidesSyntheseDocument, {
      monument,
      results,
      generatedAt: new Date(),
    }) as any
  )

  const nomSanitized = monument.nom.replace(/[^a-zA-Z0-9\u00C0-\u017F\s-]/g, '').replace(/\s+/g, '-').toLowerCase()
  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `aides-${nomSanitized}-${dateStr}.pdf`

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length.toString(),
    },
  })
}
