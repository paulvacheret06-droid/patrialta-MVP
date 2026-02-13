import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import ModeProjetForm from './_components/ModeProjetForm'

export default async function MonumentEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: monument } = await supabase
    .from('monuments')
    .select('id, nom, commune, description_projet, type_travaux, budget_estime')
    .eq('id', params.id)
    .single()

  if (!monument) notFound()

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/monuments" className="hover:text-gray-600 transition-colors">
          Monuments
        </Link>
        <span>/</span>
        <span className="text-gray-600">{monument.nom}</span>
        <span>/</span>
        <span className="text-gray-900">Mode projet</span>
      </nav>

      <h1 className="text-xl font-semibold text-gray-900 mb-1">Mode projet</h1>
      <p className="text-sm text-gray-500 mb-6">
        Précisez le projet de travaux pour affiner le matching des aides et activer le simulateur de financement.
        Ces champs sont optionnels.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <ModeProjetForm
          monumentId={params.id}
          defaultValues={{
            description_projet: monument.description_projet,
            type_travaux: monument.type_travaux,
            budget_estime: monument.budget_estime,
          }}
        />
      </div>
    </div>
  )
}
