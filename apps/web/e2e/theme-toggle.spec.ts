import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark mode', async ({ page }) => {
    // Start at home page
    await page.goto('/');

    // Get the toggle button
    const toggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(toggle).toBeVisible();

    // Get html element to check class
    const html = page.locator('html');

    // Click to toggle (initial state depends on system, but click should change it)
    const initialIsDark = await html.evaluate(el => el.classList.contains('dark'));
    
    await toggle.click();
    
    if (initialIsDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }

    // Click again to return to initial state
    await toggle.click();

    if (initialIsDark) {
      await expect(html).toHaveClass(/dark/);
    } else {
      await expect(html).not.toHaveClass(/dark/);
    }
  });
});
