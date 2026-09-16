const { test, expect } = require('@playwright/test');

test.describe('Jobs Page', () => {
  test('should load jobs page', async ({ page }) => {
    // Some apps require login first. We assume jobs might be accessible or will redirect.
    await page.goto('/jobs');

    // The app uses client-side routing, so page.url() might not reflect the redirect immediately.
    // Wait for either the jobs heading or the login heading to appear.
    const jobsHeading = page.getByRole('heading', { name: /job recommendations/i });
    const loginHeading = page.getByRole('heading', { name: /sign in/i });

    await expect(jobsHeading.or(loginHeading)).toBeVisible();
  });
});
