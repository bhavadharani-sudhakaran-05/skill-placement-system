const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test('should display login page correctly', async ({ page }) => {
    // We assume the app is running on localhost:3000 as configured in playwright.config.js
    await page.goto('/login');
    await page.pause();
    // Check if the login form is present
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.pause();
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // We expect some error message or a toast to appear
    // Adjust selector based on actual app implementation
    // await expect(page.locator('.error-message')).toBeVisible();
  });
});
