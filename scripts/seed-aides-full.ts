/**
 * Seed complet — catalogue aides enrichi (33 aides réelles)
 * Usage : npx tsx --env-file=.env.local scripts/seed-aides-full.ts
 *
 * - Valide chaque aide avec AideSchema (Zod) avant insertion
 * - Upsert idempotent : ne réinsère pas les aides déjà présentes (par nom)
 * - Rapport final : insérées / ignorées (déjà présentes)
 */

import { createClient } from '@supabase/supabase-js'
import { AideSchema } from '../lib/validations/aide'
import { AIDES_ENRICHIES } from '../lib/s1/seed/aides-enrichies'

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
  console.log(`\n🌱 Seed aides enrichi — ${AIDES_ENRICHIES.length} aides à traiter\n`)

  // 1. Validation Zod
  const validated: typeof AIDES_ENRICHIES = []
  for (const [i, aide] of AIDES_ENRICHIES.entries()) {
    const result = AideSchema.safeParse(aide)
    if (!result.success) {
      console.error(`❌ Aide [${i}] "${aide.nom}" invalide :`)
      console.error(result.error.flatten().fieldErrors)
      process.exit(1)
    }
    validated.push(result.data)
  }
  console.log(`✓ ${validated.length} aides validées par Zod`)

  // 2. Récupérer les noms déjà présents en base
  const { data: existing, error: fetchError } = await supabase
    .from('aides')
    .select('nom')

  if (fetchError) {
    console.error('❌ Impossible de lire la table aides :', fetchError.message)
    process.exit(1)
  }

  const existingNoms = new Set((existing ?? []).map((a: { nom: string }) => a.nom))
  console.log(`ℹ️  ${existingNoms.size} aides déjà présentes en base\n`)

  // 3. Filtrer les nouvelles aides uniquement
  const toInsert = validated.filter((aide) => !existingNoms.has(aide.nom))
  const skipped = validated.length - toInsert.length

  if (toInsert.length === 0) {
    console.log(`✅ Toutes les aides sont déjà présentes — rien à insérer`)
    console.log(`📊 Total aides en base : ${existingNoms.size}`)
    console.log('✅ Seed terminé (déjà appliqué)\n')
    process.exit(0)
  }

  console.log(`→ ${toInsert.length} nouvelles aides à insérer, ${skipped} ignorées (déjà présentes)`)

  // 4. Insertion par lots de 10 pour éviter les timeouts
  const BATCH_SIZE = 10
  let inserted = 0

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE)
    const { data, error } = await supabase
      .from('aides')
      .insert(batch)
      .select('id, nom')

    if (error) {
      console.error(`❌ Erreur lors de l'insertion du lot ${Math.floor(i / BATCH_SIZE) + 1} :`, error.message)
      process.exit(1)
    }

    inserted += data?.length ?? 0
    console.log(`  ✓ Lot ${Math.floor(i / BATCH_SIZE) + 1} — ${data?.length ?? 0} aides insérées`)
  }

  // 5. Vérification finale
  const { count } = await supabase.from('aides').select('*', { count: 'exact', head: true })
  console.log(`\n📊 Résumé :`)
  console.log(`  - Insérées : ${inserted}`)
  console.log(`  - Ignorées (déjà présentes) : ${skipped}`)
  console.log(`  - Total en base : ${count}`)

  if ((count ?? 0) >= 30) {
    console.log('\n✅ Seed enrichi terminé avec succès — catalogue ≥ 30 aides\n')
  } else {
    console.warn(`\n⚠️  Seulement ${count} aides en base — attendu ≥ 30\n`)
  }
}

main().catch((err) => {
  console.error('❌ Erreur inattendue :', err)
  process.exit(1)
})
