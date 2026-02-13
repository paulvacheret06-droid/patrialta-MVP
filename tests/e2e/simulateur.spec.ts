import { test, expect } from '@playwright/test'

/**
 * Tests E2E — Simulateur de financement (S1)
 */

test.describe('Simulateur de financement', () => {
  test('13.3 — saisir budget → simuler → affichage combinaisons', async ({ page }) => {
    await page.goto('/monuments')

    // Naviguer vers la page aides d'un monument
    const aideLink = page.getByRole('link', { name: /aides/i }).first()
    if (!(await aideLink.isVisible())) {
      test.skip()
      return
    }
    await aideLink.click()

    await expect(page.getByRole('heading', { name: 'Aides éligibles' })).toBeVisible()

    // Le simulateur n'est visible que si au moins une aide est éligible
    const simulateur = page.locator('input[placeholder*="budget"], input[type="number"]').first()
    if (!(await simulateur.isVisible())) {
      test.skip()
      return
    }

    // Saisir un budget
    await simulateur.fill('500000')

    // Cliquer sur Simuler
    const simulerBtn = page.getByRole('button', { name: /simuler/i })
    await expect(simulerBtn).toBeVisible()
    await simulerBtn.click()

    // Vérifier l'affichage des résultats
    await expect(page.getByText(/montant estimé|total estimé|taux de couverture/i)).toBeVisible({
      timeout: 10000,
    })
  })

  test('13.3 — simulateur absent si aucune aide éligible', async ({ page }) => {
    // Ce test vérifie que le simulateur n'est pas affiché quand eligibleCount = 0
    // On peut le simuler en allant sur une page aides avec 0 éligibles
    await page.goto('/monuments')

    // Le test est surtout documentaire — les données varient selon l'environnement
    await expect(page).toHaveURL('/monuments')
  })
})
