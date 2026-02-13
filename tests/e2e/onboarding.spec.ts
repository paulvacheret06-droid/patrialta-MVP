import { test, expect } from '@playwright/test'

test.describe('Onboarding — état vide et navigation', () => {
  test('footer présent avec les 3 liens légaux sur la landing', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'CGU' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Mentions légales' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Confidentialité' })).toBeVisible()
  })

  test('footer présent sur la page inscription', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('link', { name: 'CGU' })).toBeVisible()
  })

  test('case RGPD présente sur le formulaire inscription', async ({ page }) => {
    await page.goto('/signup')
    const checkbox = page.locator('input[name="rgpd_accepted"]')
    await expect(checkbox).toBeVisible()
    await expect(checkbox).not.toBeChecked()
  })

  test('liens CGU et confidentialité dans le formulaire inscription', async ({ page }) => {
    await page.goto('/signup')
    const linkCgu = page.getByRole('link', { name: 'CGU' }).first()
    await expect(linkCgu).toHaveAttribute('href', '/legal/cgu')
    await expect(linkCgu).toHaveAttribute('target', '_blank')
  })
})
