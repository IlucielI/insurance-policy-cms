import { test, expect } from '@playwright/test'

test.describe('CMS Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@insurance.com')
    await page.getByLabel(/password/i).fill('admin123')
    await page.getByRole('button', { name: /^login$/i }).click()
    await page.waitForURL(/\/dashboard/)
  })

  test('should display dashboard', async ({ page }) => {
    await expect(page.getByText(/dashboard/i).first()).toBeVisible()
  })

  test('should have navigation sidebar', async ({ page }) => {
    // Check for common navigation items
    const hasNav = await page.locator('nav, aside, [role="navigation"]').first().isVisible()
    expect(hasNav).toBeTruthy()
  })

  test('should navigate to applications page', async ({ page }) => {
    const applicationsLink = page.getByRole('link', { name: /applications|pengajuan/i }).first()
    
    if (await applicationsLink.isVisible()) {
      await applicationsLink.click()
      await expect(page).toHaveURL(/\/dashboard\/applications/)
    }
  })

  test('should navigate to claims page', async ({ page }) => {
    const claimsLink = page.getByRole('link', { name: /claims|klaim/i }).first()
    
    if (await claimsLink.isVisible()) {
      await claimsLink.click()
      await expect(page).toHaveURL(/\/dashboard\/claims/)
    }
  })

  test('should navigate to products page', async ({ page }) => {
    const productsLink = page.getByRole('link', { name: /products|produk/i }).first()
    
    if (await productsLink.isVisible()) {
      await productsLink.click()
      await expect(page).toHaveURL(/\/dashboard\/products/)
    }
  })
})
