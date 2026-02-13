import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('accessible sans authentification', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('h1')).toContainText('monument')
  })

  test('CTA Commencer présent et fonctionnel', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /commencer gratuitement/i })
    await expect(cta).toBeVisible()
    await cta.click()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('4 piliers de valeur affichés', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Exhaustivité transversale')).toBeVisible()
    await expect(page.getByText('Proactivité')).toBeVisible()
    await expect(page.getByText('Accessibilité sans expertise')).toBeVisible()
    await expect(page.getByText('Continuité')).toBeVisible()
  })

  test('rendu responsive mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    const cta = page.getByRole('link', { name: /commencer gratuitement/i })
    await expect(cta).toBeVisible()
    const box = await cta.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(375)
  })

  test('rendu responsive desktop (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.getByRole('link', { name: /commencer gratuitement/i })).toBeVisible()
  })
})
