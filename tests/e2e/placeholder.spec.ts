import { test, expect } from '@playwright/test'

// Placeholder — les specs E2E seront ajoutées au fil du développement
test("page d'accueil accessible", async ({ page }) => {
  await page.goto('http://localhost:3000')
  await expect(page).toHaveTitle(/PatriAlta/)
})
