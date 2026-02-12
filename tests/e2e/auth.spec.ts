import { test, expect } from '@playwright/test'

// Email unique par run pour éviter les collisions
const testEmail = `test-${Date.now()}@patrialta-test.example`
const testPassword = 'TestPassword123'

test.describe('Authentification', () => {
  test('inscription complète → redirection /monuments', async ({ page }) => {
    await page.goto('/signup')

    // Vérifier que la page est bien chargée
    await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible()

    // Remplir les identifiants
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)

    // Remplir le profil
    await page.selectOption('select[name="statut_juridique"]', 'collectivite')
    await page.fill('input[name="commune"]', 'Lyon')

    // Soumettre
    await page.click('button[type="submit"]')

    // Doit rediriger vers /monuments
    await expect(page).toHaveURL('/monuments', { timeout: 10000 })
  })

  test('connexion avec identifiants valides → redirection /monuments', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()

    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/monuments', { timeout: 10000 })
  })

  test("connexion avec mauvais mot de passe → message d'erreur", async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'mauvais-mot-de-passe')
    await page.click('button[type="submit"]')

    await expect(page.getByText('Email ou mot de passe incorrect.')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('déconnexion → redirection /login', async ({ page }) => {
    // Se connecter d'abord
    await page.goto('/login')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/monuments', { timeout: 10000 })

    // Déconnexion
    await page.click('button[type="submit"]') // bouton Déconnexion dans le header
    await expect(page).toHaveURL('/login', { timeout: 5000 })
  })
})

test.describe('Protection des routes', () => {
  test('accès non authentifié à /monuments → redirection /login?redirect=/monuments', async ({ page }) => {
    await page.goto('/monuments')
    await expect(page).toHaveURL(/\/login\?redirect=\/monuments/, { timeout: 5000 })
  })

  test('accès non authentifié à /aides → redirection /login', async ({ page }) => {
    await page.goto('/aides')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  test('utilisateur connecté sur /login → redirection /monuments', async ({ page }) => {
    // Se connecter
    await page.goto('/login')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/monuments', { timeout: 10000 })

    // Revenir sur /login → doit rediriger
    await page.goto('/login')
    await expect(page).toHaveURL('/monuments', { timeout: 5000 })
  })
})
