import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test('should render all form fields', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByLabel('Nome')).toBeVisible();
    await expect(page.getByLabel('E-mail')).toBeVisible();
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirmar Senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
  });

  test('should show validation errors on physical submit with empty fields', async ({ page }) => {
    await page.goto('/register');
    
    await page.getByRole('button', { name: 'Criar conta' }).click();

    // Zod default messages
    await expect(page.getByText('String must contain at least 1 character')).toHaveCount(2);
    await expect(page.getByText('Invalid email')).toBeVisible();
    await expect(page.getByText('String must contain at least 6 character')).toBeVisible();
  });

  test('should register and redirect on success', async ({ page }) => {
    await page.goto('/register');

    const uniqueEmail = `test-${Date.now()}@example.com`;

    await page.getByLabel('Nome').fill('Test User');
    await page.getByLabel('E-mail').fill(uniqueEmail);
    await page.getByLabel('Senha', { exact: true }).fill('Password123!');
    await page.getByLabel('Confirmar Senha').fill('Password123!');

    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL(/\/login\?registered=true/);
  });

  test('should show "Este e-mail já está em uso" on 409', async ({ page }) => {
    // 1. First registration
    const email = `duplicate-${Date.now()}@example.com`;
    
    await page.goto('/register');
    await page.getByLabel('Nome').fill('First User');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Senha', { exact: true }).fill('Password123!');
    await page.getByLabel('Confirmar Senha').fill('Password123!');
    await page.getByRole('button', { name: 'Criar conta' }).click();
    await expect(page).toHaveURL(/\/login\?registered=true/);

    // 2. Second registration with same email
    await page.goto('/register');
    await page.getByLabel('Nome').fill('Second User');
    await page.getByLabel('E-mail').fill(email);
    await page.getByLabel('Senha', { exact: true }).fill('Password123!');
    await page.getByLabel('Confirmar Senha').fill('Password123!');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('Este e-mail já está em uso.')).toBeVisible();
  });
});
