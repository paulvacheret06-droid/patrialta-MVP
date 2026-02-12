import { test, expect, type Page } from '@playwright/test'

const testEmail = `eligibility-${Date.now()}@patrialta-test.example`
const testPassword = 'TestPassword123'

async function setupAccount(page: Page) {
  await page.goto('/signup')
  await page.fill('input[name="email"]', testEmail)
  await page.fill('input[name="password"]', testPassword)
  await page.selectOption('select[name="statut_juridique"]', 'collectivite')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/monuments', { timeout: 10000 })
}

async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[name="email"]', testEmail)
  await page.fill('input[name="password"]', testPassword)
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/monuments', { timeout: 10000 })
}

async function createMonument(page: Page) {
  await page.fill('input[name="nom"]', 'Église Saint-Pierre de test')
  await page.fill('input[name="commune"]', 'Lyon')
  await page.fill('input[name="departement"]', 'Rhône')
  await page.fill('input[name="region"]', 'Auvergne-Rhône-Alpes')
  await page.selectOption('select[name="type_protection"]', 'classe')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Église Saint-Pierre de test')).toBeVisible({ timeout: 8000 })
}

test.describe.serial('Eligibility — page aides', () => {
  test('setup : créer un compte et un monument', async ({ page }) => {
    await setupAccount(page)
    await createMonument(page)
  })

  test('lien "Voir les aides" visible sur chaque monument', async ({ page }) => {
    await login(page)
    await expect(page.locator('text=Voir les aides').first()).toBeVisible()
  })

  test('navigation vers la page aides', async ({ page }) => {
    await login(page)
    await page.locator('text=Voir les aides').first().click()
    await expect(page).toHaveURL(/\/monuments\/.+\/aides/, { timeout: 10000 })
    await expect(page.locator('h1:has-text("Aides éligibles")')).toBeVisible()
  })

  test('affichage des aides avec statuts ✓ / ✗ / ?', async ({ page }) => {
    await login(page)
    await page.locator('text=Voir les aides').first().click()
    await page.waitForURL(/\/monuments\/.+\/aides/, { timeout: 10000 })

    // Au moins une carte aide doit être présente
    await expect(page.locator('[class*="rounded-lg"]').first()).toBeVisible({ timeout: 15000 })

    // Vérifier la présence d'au moins un badge statut
    const hasBadge =
      (await page.locator('text=✓ Éligible').count()) > 0 ||
      (await page.locator('text=✗ Non éligible').count()) > 0 ||
      (await page.locator('text=? À vérifier').count()) > 0
    expect(hasBadge).toBeTruthy()
  })

  test('filtre par catégorie restauration', async ({ page }) => {
    await login(page)
    await page.locator('text=Voir les aides').first().click()
    await page.waitForURL(/\/monuments\/.+\/aides/, { timeout: 10000 })

    await page.locator('text=Restauration').first().click()
    await expect(page).toHaveURL(/categorie=restauration/)
  })

  test('bouton Recalculer déclenche le recalcul', async ({ page }) => {
    await login(page)
    await page.locator('text=Voir les aides').first().click()
    await page.waitForURL(/\/monuments\/.+\/aides/, { timeout: 10000 })

    await page.locator('button:has-text("Recalculer")').click()
    // Spinner apparaît brièvement
    // Après recalcul, la page est rafraîchie
    await expect(page.locator('h1:has-text("Aides éligibles")')).toBeVisible({ timeout: 15000 })
  })

  // ── Responsive ──────────────────────────────────────────────────────────────

  test('responsive — mobile 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await login(page)
    await page.locator('text=Voir les aides').first().click()
    await page.waitForURL(/\/monuments\/.+\/aides/, { timeout: 10000 })
    await expect(page.locator('h1:has-text("Aides éligibles")')).toBeVisible()
  })

  test('responsive — desktop 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await login(page)
    await page.locator('text=Voir les aides').first().click()
    await page.waitForURL(/\/monuments\/.+\/aides/, { timeout: 10000 })
    await expect(page.locator('h1:has-text("Aides éligibles")')).toBeVisible()
  })
})
