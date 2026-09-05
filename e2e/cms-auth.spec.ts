import { test, expect } from '@playwright/test'

test.describe('CMS Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByText(/insurance admin/i)).toBeVisible()
    await expect(page.getByText(/login ke admin panel/i)).toBeVisible()
  })

  test('should show demo credentials', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByText(/demo credentials/i)).toBeVisible()
    await expect(page.getByText(/admin@insurance.com/)).toBeVisible()
  })

  test('should fill demo credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByRole('button', { name: /click to use/i }).click()
    
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)
    
    await expect(emailInput).toHaveValue('admin@insurance.com')
    await expect(passwordInput).toHaveValue('admin123')
  })

  test('should login and redirect to dashboard', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('admin@insurance.com')
    await page.getByLabel(/password/i).fill('admin123')
    await page.getByRole('button', { name: /^login$/i }).click()
    
    await page.waitForURL(/\/dashboard/, { timeout: 5000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
