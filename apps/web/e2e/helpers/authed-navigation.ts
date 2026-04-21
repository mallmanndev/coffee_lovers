import type { Page } from '@playwright/test';

const AUTH_STORAGE_KEY = 'coffee_lovers_auth';

function fakeSessionJson(): string {
  return JSON.stringify({
    accessToken: 'playwright-e2e-token',
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'E2E User',
      email: 'e2e@example.com',
      city: 'São Paulo',
      state: 'SP',
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
    },
  });
}

/** Call before `page.goto` so protected routes see a logged-in session. */
export async function seedAuthedSession(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, value }: { key: string; value: string }) => {
      localStorage.setItem(key, value);
    },
    { key: AUTH_STORAGE_KEY, value: fakeSessionJson() }
  );
}
