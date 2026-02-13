import { test, expect } from '@playwright/test'

/**
 * Tests E2E — Génération de dossier (S2)
 *
 * Pré-requis : un monument avec au moins une aide éligible en base.
 * Les tests supposent un utilisateur déjà authentifié via `storageState`.
 */

test.describe('Génération de dossier S2', () => {
  test('13.1 — flow complet : liste aides → démarrer dossier → générer', async ({ page }) => {
    // Aller sur la liste des monuments
    await page.goto('/monuments')
    await expect(page.getByRole('heading', { name: 'Monuments' })).toBeVisible()

    // Cliquer sur "Aides" du premier monument
    const aideLink = page.getByRole('link', { name: /aides/i }).first()
    if (await aideLink.isVisible()) {
      await aideLink.click()
    } else {
      // Naviguer directement si aucun lien visible (pas de monument)
      test.skip()
      return
    }

    // Vérifier page aides
    await expect(page.getByRole('heading', { name: 'Aides éligibles' })).toBeVisible()

    // Chercher le CTA "Démarrer un dossier" (visible uniquement pour les aides éligibles)
    const dossierCTA = page.getByRole('button', { name: /démarrer un dossier/i }).first()

    if (!(await dossierCTA.isVisible())) {
      // Pas d'aide éligible — le test est valide mais non exécutable
      test.skip()
      return
    }

    // Cliquer sur le CTA
    await dossierCTA.click()

    // Attendre la redirection vers /dossiers/[id]
    await expect(page).toHaveURL(/\/dossiers\/[a-z0-9-]+/, { timeout: 15000 })

    // Vérifier les éléments du dashboard dossier
    await expect(page.getByText('Demande de subvention')).toBeVisible()
    await expect(page.getByText(/important/i)).toBeVisible() // disclaimer

    // Cliquer sur "Générer le dossier"
    const generateBtn = page.getByRole('button', { name: /générer le dossier/i })
    await expect(generateBtn).toBeVisible()
    await generateBtn.click()

    // Vérifier l'indicateur de génération en cours
    await expect(page.getByText(/génération en cours/i)).toBeVisible({ timeout: 10000 })

    // Attendre la fin (max 2 minutes pour la génération Claude)
    await expect(page.getByText(/génération en cours/i)).not.toBeVisible({ timeout: 120000 })
  })

  test('dashboard dossier — éléments requis présents', async ({ page }) => {
    await page.goto('/monuments')

    // Chercher un lien vers un dossier existant
    const dossierLink = page.getByRole('link', { name: /dossier/i }).first()
    if (!(await dossierLink.isVisible())) {
      test.skip()
      return
    }
    await dossierLink.click()

    await expect(page).toHaveURL(/\/dossiers\//)

    // Disclaimer présent
    await expect(page.getByText(/généré automatiquement/i)).toBeVisible()

    // Barre de progression présente
    await expect(page.getByText(/%/)).toBeVisible()
  })
})
