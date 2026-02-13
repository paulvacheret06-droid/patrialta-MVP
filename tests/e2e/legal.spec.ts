import { test, expect } from '@playwright/test'

const LEGAL_PAGES = [
  { path: '/legal/cgu', title: 'CGU', heading: /conditions générales/i },
  { path: '/legal/mentions-legales', title: 'Mentions légales', heading: /mentions légales/i },
  { path: '/legal/confidentialite', title: 'Confidentialité', heading: /politique de confidentialité/i },
]

for (const { path, title, heading } of LEGAL_PAGES) {
  test.describe(`Page légale : ${title}`, () => {
    test('accessible sans authentification', async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
    })

    test('contient le bon titre h1', async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('h1').first()).toBeVisible()
      await expect(page.locator('h1').first()).toHaveText(heading)
    })

    test('contenu non vide', async ({ page }) => {
      await page.goto(path)
      const article = page.locator('article')
      await expect(article).toBeVisible()
      const text = await article.textContent()
      expect(text?.length).toBeGreaterThan(200)
    })

    test('footer présent avec liens légaux', async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole('link', { name: 'CGU' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Mentions légales' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Confidentialité' })).toBeVisible()
    })

    test('lien retour vers PatriAlta présent', async ({ page }) => {
      await page.goto(path)
      const back = page.getByRole('link', { name: /patrialta/i })
      await expect(back).toBeVisible()
      await expect(back).toHaveAttribute('href', '/')
    })
  })
}
