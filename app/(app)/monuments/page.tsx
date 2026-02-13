import { createClient } from '@/lib/supabase/server'
import MonumentList from './_components/MonumentList'
import MonumentForm from './_components/MonumentForm'
import EmptyState from './_components/EmptyState'

export default async function MonumentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: monuments = [] } = user
    ? await supabase
        .from('monuments')
        .select('id, nom, commune, departement, region, type_protection, is_verified_merimee, type_travaux, budget_estime')
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Mes monuments</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {!monuments || monuments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg px-6">
              <MonumentList monuments={monuments} />
            </div>
          )}
        </div>

        <div id="monument-form">
          <MonumentForm />
        </div>
      </div>
    </div>
  )
}
