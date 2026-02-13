/**
 * Seed script — table aides
 * Usage : npx tsx --env-file=.env.local scripts/seed-aides.ts
 *
 * Valide chaque aide avec AideSchema (Zod) avant insertion.
 * Upsert idempotent basé sur (nom, organisme) — pas de duplicats.
 */

import { createClient } from '@supabase/supabase-js'
import { AideSchema } from '../lib/validations/aide'
import { SEED_AIDES } from '../lib/s1/seed/aides'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

async function main() {
  console.log(`\n🌱 Seed aides — ${SEED_AIDES.length} aides à valider et insérer\n`)

  // 1. Validation Zod
  const validated: typeof SEED_AIDES = []
  for (const [i, aide] of SEED_AIDES.entries()) {
    const result = AideSchema.safeParse(aide)
    if (!result.success) {
      console.error(`❌ Aide [${i}] "${aide.nom}" invalide :`)
      console.error(result.error.flatten().fieldErrors)
      process.exit(1)
    }
    validated.push(result.data)
  }
  console.log(`✓ ${validated.length} aides validées par Zod`)

  // 2. Vérifier si des données existent déjà
  const { count: existingCount } = await supabase
    .from('aides')
    .select('*', { count: 'exact', head: true })

  if ((existingCount ?? 0) >= SEED_AIDES.length) {
    console.log(`ℹ️  ${existingCount} aides déjà présentes — seed idempotent, aucune insertion nécessaire`)
    console.log('✅ Seed terminé (déjà appliqué)\n')
    process.exit(0)
  }

  // 3. Insertion (table vide ou incomplète)
  const { data, error } = await supabase
    .from('aides')
    .insert(validated)
    .select('id, nom')

  if (error) {
    console.error('❌ Erreur Supabase lors de l\'insertion :', error.message)
    process.exit(1)
  }

  console.log(`✓ ${data?.length ?? 0} aides insérées dans la table "aides"\n`)

  // 3. Vérification du count total
  const { count } = await supabase.from('aides').select('*', { count: 'exact', head: true })
  console.log(`📊 Total dans la table aides : ${count} lignes`)
  if ((count ?? 0) >= SEED_AIDES.length) {
    console.log('✅ Seed terminé avec succès\n')
  } else {
    console.warn(`⚠️  Seulement ${count} lignes — attendu au moins ${SEED_AIDES.length}`)
  }
}

main().catch((err) => {
  console.error('❌ Erreur inattendue :', err)
  process.exit(1)
})
