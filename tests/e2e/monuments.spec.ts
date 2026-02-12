import { test, expect, type Page } from '@playwright/test'

// Email unique par run pour éviter les collisions
const testEmail = `monuments-${Date.now()}@patrialta-test.example`
const testPassword = 'TestPassword123'

async function login(page: Page, email = testEmail) {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', testPassword)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/monuments', { timeout: 10000 })
}

test.describe.serial('Monuments', () => {
  test('setup : créer un compte de test', async ({ page }) => {
    await page.goto('/signup')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.selectOption('select[name="statut_juridique"]', 'collectivite')
    await page.fill('input[name="commune"]', 'Lyon')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/monuments', { timeout: 10000 })
  })

  // Task 7.3 — état vide
  test('état vide — CTA visible après inscription', async ({ page }) => {
    await login(page)
    await expect(page.getByText('Aucun monument ajouté')).toBeVisible()
    await expect(page.getByText('Ajoutez votre premier monument pour commencer.')).toBeVisible()
  })

  // Task 7.1 — création en mode manuel
  test('création d\'un monument en mode manuel', async ({ page }) => {
    await login(page)

    // Basculer en mode manuel
    await page.click('text=Je ne trouve pas mon monument')

    // Vérifier que le mode saisie manuelle est actif
    await expect(page.getByText('Saisie manuelle')).toBeVisible()

    // Remplir le formulaire
    await page.fill('input[name="nom"]', 'Château de Tournon')
    await page.fill('input[name="commune"]', 'Tournon-sur-Rhône')
    await page.fill('input[name="departement"]', 'Ardèche')
    await page.fill('input[name="region"]', 'Auvergne-Rhône-Alpes')
    await page.selectOption('select[name="type_protection"]', 'inscrit')

    // Soumettre
    await page.click('button[type="submit"]')

    // Le monument doit apparaître dans la liste
    await expect(page.getByText('Château de Tournon')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Inscrit MH')).toBeVisible()
  })

  // Task 7.2 — suppression
  test('suppression d\'un monument avec confirmation', async ({ page }) => {
    await login(page)

    // Le monument créé précédemment doit être visible
    await expect(page.getByText('Château de Tournon')).toBeVisible({ timeout: 5000 })

    // Cliquer sur supprimer
    await page.getByRole('button', { name: 'Supprimer' }).first().click()

    // Le bouton confirmer doit apparaître
    await expect(page.getByRole('button', { name: 'Confirmer' })).toBeVisible()

    // Confirmer la suppression
    await page.getByRole('button', { name: 'Confirmer' }).click()

    // La liste doit être vide
    await expect(page.getByText('Aucun monument ajouté')).toBeVisible({ timeout: 5000 })
  })
})
