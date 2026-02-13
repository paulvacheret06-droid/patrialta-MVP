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

  const count = monuments?.length ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes monuments</h1>
        {count > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {count} monument{count > 1 ? 's' : ''} enregistré{count > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste */}
        <div className="lg:col-span-2">
          {!monuments || monuments.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              className="bg-white border border-gray-200 rounded-xl p-3 space-y-3"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <MonumentList monuments={monuments} />
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div id="monument-form">
          <MonumentForm />
        </div>
      </div>
    </div>
  )
}
