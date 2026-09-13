const { test, expect } = require('@playwright/test');

test.describe('Jobs Page', () => {
  test('should load jobs page', async ({ page }) => {
    // Some apps require login first. We assume jobs might be accessible or will redirect.
    await page.goto('/jobs');
    
    // Just verify that the page loads without crashing. 
    // If it redirects to login, check for login.
    const url = page.url();
    if (url.includes('/login')) {
      await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    } else {
      await expect(page.getByRole('heading', { name: /jobs/i })).toBeVisible();
    }
  });
});
