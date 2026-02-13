/**
 * Client API Aides-territoires.
 * Récupère les aides patrimoine avec pagination.
 * Doc : https://aides-territoires.beta.gouv.fr/api/
 */
import { AideTerritorieSchema, type AideTerritorie } from '@/lib/validations/aides-territoires'

const BASE_URL = 'https://aides-territoires.beta.gouv.fr/api/aids/'
// Mots-clés cibles pour filtrer les aides patrimoine
const PATRIMOINE_CATEGORIES = ['patrimoine', 'culture', 'tourisme']

interface ApiResponse {
  count: number
  next: string | null
  results: unknown[]
}

/**
 * Récupère toutes les aides liées au patrimoine depuis Aides-territoires.
 * Gère la pagination automatiquement.
 */
export async function fetchAidesPatrimoine(): Promise<AideTerritorie[]> {
  const apiKey = process.env.AIDES_TERRITOIRES_API_KEY
  const headers: HeadersInit = {
    Accept: 'application/json',
  }
  if (apiKey) {
    headers['Authorization'] = `Token ${apiKey}`
  }

  const allAides: AideTerritorie[] = []
  // Paramètres de filtre : catégories patrimoine + aides en cours (is_live)
  let url: string | null =
    `${BASE_URL}?format=json&limit=100&categories=${PATRIMOINE_CATEGORIES.join(',')}&is_live=true`

  let pageCount = 0
  const MAX_PAGES = 20 // Sécurité anti-boucle infinie

  while (url && pageCount < MAX_PAGES) {
    const response = await fetch(url, { headers, next: { revalidate: 0 } })

    if (!response.ok) {
      throw new Error(
        `Aides-territoires API error: ${response.status} ${response.statusText}`
      )
    }

    const data = (await response.json()) as ApiResponse

    for (const raw of data.results) {
      const parsed = AideTerritorieSchema.safeParse(raw)
      if (parsed.success) {
        allAides.push(parsed.data)
      }
      // Les objets invalides sont ignorés silencieusement
    }

    url = data.next
    pageCount++
  }

  return allAides
}
