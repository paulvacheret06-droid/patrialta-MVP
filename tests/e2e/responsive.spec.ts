import { test, expect } from '@playwright/test'

/**
 * Tests E2E — Rendu responsive (S1 + S2)
 * Vérifie que les pages clés s'affichent correctement sur mobile (375px) et desktop (1280px).
 */

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 800 },
]

test.describe('Responsive — /dossiers/[id]', () => {
  for (const viewport of VIEWPORTS) {
    test(`13.4 — rendu ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      await page.goto('/monuments')

      const dossierLink = page.getByRole('link', { name: /dossier/i }).first()
      if (!(await dossierLink.isVisible())) {
        test.skip()
        return
      }

      await dossierLink.click()
      await expect(page).toHaveURL(/\/dossiers\//)

      // Le contenu principal doit être visible
      await expect(page.getByText(/demande de subvention|dossier/i)).toBeVisible()

      // Vérifier qu'il n'y a pas de débordement horizontal
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20) // 20px de tolérance
    })
  }
})

test.describe('Responsive — /monuments/[id]/aides', () => {
  for (const viewport of VIEWPORTS) {
    test(`13.5 — rendu ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      await page.goto('/monuments')

      const aideLink = page.getByRole('link', { name: /aides/i }).first()
      if (!(await aideLink.isVisible())) {
        test.skip()
        return
      }

      await aideLink.click()
      await expect(page).toHaveURL(/\/monuments\/[^/]+\/aides/)

      // La page doit afficher le titre
      await expect(page.getByRole('heading', { name: 'Aides éligibles' })).toBeVisible()

      // Vérifier qu'il n'y a pas de débordement horizontal
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20)
    })
  }
})
