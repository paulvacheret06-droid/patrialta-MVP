import { test, expect } from '@playwright/test'

/**
 * Tests E2E — Export PDF et Word du dossier (S2)
 */

test.describe('Export dossier PDF et DOCX', () => {
  test('13.2 — boutons export visibles sur dossier avec contenu', async ({ page }) => {
    // Naviguer vers un dossier (suppose un dossier existant)
    await page.goto('/monuments')

    const dossierLink = page.getByRole('link', { name: /dossier/i }).first()
    if (!(await dossierLink.isVisible())) {
      test.skip()
      return
    }
    await dossierLink.click()

    await expect(page).toHaveURL(/\/dossiers\//)

    // Chercher les boutons export (visibles uniquement si contenu généré)
    const exportPdfBtn = page.getByRole('button', { name: /exporter pdf/i })
    const exportWordBtn = page.getByRole('button', { name: /exporter word/i })

    if (!(await exportPdfBtn.isVisible())) {
      // Pas de contenu généré — skip
      test.skip()
      return
    }

    await expect(exportPdfBtn).toBeVisible()
    await expect(exportWordBtn).toBeVisible()

    // Vérifier que le clic PDF déclenche un téléchargement
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportPdfBtn.click(),
    ])

    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  })

  test('13.2 — export Word déclenche un téléchargement .docx', async ({ page }) => {
    await page.goto('/monuments')

    const dossierLink = page.getByRole('link', { name: /dossier/i }).first()
    if (!(await dossierLink.isVisible())) {
      test.skip()
      return
    }
    await dossierLink.click()

    await expect(page).toHaveURL(/\/dossiers\//)

    const exportWordBtn = page.getByRole('button', { name: /exporter word/i })
    if (!(await exportWordBtn.isVisible())) {
      test.skip()
      return
    }

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportWordBtn.click(),
    ])

    expect(download.suggestedFilename()).toMatch(/\.docx$/)
  })
})
