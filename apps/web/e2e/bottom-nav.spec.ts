import { test, expect } from '@playwright/test';
import { seedAuthedSession } from './helpers/authed-navigation';

test.describe('BottomNav', () => {
  test('should be visible on the feed page', async ({ page }) => {
    await seedAuthedSession(page);
    await page.goto('/feed');

    await expect(page.getByRole('navigation', { name: 'Menu principal' })).toBeVisible();
  });

  test('should have a link to the profile page', async ({ page }) => {
    await seedAuthedSession(page);
    await page.goto('/feed');

    const profileLink = page.getByRole('link', { name: 'Perfil' });
    await expect(profileLink).toBeVisible();
    await expect(profileLink).toHaveAttribute('href', '/profile/me');
  });

  test('should have a link to the stock page', async ({ page }) => {
    await seedAuthedSession(page);
    await page.goto('/feed');

    const stockLink = page.getByRole('link', { name: 'Estoque' });
    await expect(stockLink).toBeVisible();
    await expect(stockLink).toHaveAttribute('href', '/stock');
  });

  test('should have a link to the equipment page', async ({ page }) => {
    await seedAuthedSession(page);
    await page.goto('/feed');

    const equipmentLink = page.getByRole('link', { name: 'Equipamentos' });
    await expect(equipmentLink).toBeVisible();
    await expect(equipmentLink).toHaveAttribute('href', '/equipment');
  });

  test('should highlight the active route', async ({ page }) => {
    await seedAuthedSession(page);
    await page.goto('/feed');

    // No item should be active on /feed (neither /profile nor /stock)
    const profileLink = page.getByRole('link', { name: 'Perfil' });
    const stockLink = page.getByRole('link', { name: 'Estoque' });

    await expect(profileLink).not.toHaveClass(/bg-primary/);
    await expect(stockLink).not.toHaveClass(/bg-primary/);
  });
});
