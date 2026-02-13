/**
 * Rate limiting en mémoire pour la génération de dossiers (S2).
 * Limite : 10 générations par heure par user_id.
 *
 * Note : fonctionne uniquement dans le même processus Node.js.
 * Sur Vercel, chaque instance conserve son propre état en mémoire.
 * Suffisant pour le MVP (instances Vercel peu nombreuses).
 */

const MAX_REQUESTS = 10
const WINDOW_MS = 60 * 60 * 1000 // 1 heure

interface RateLimitEntry {
  count: number
  resetAt: number // timestamp ms
}

// Map globale — persiste entre les requêtes dans le même processus
const rateLimitMap = new Map<string, RateLimitEntry>()

export function checkRateLimit(userId: string): { allowed: boolean; resetAt?: Date } {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  if (!entry || now >= entry.resetAt) {
    // Première requête ou fenêtre expirée : créer/réinitialiser
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, resetAt: new Date(entry.resetAt) }
  }

  entry.count += 1
  return { allowed: true }
}
