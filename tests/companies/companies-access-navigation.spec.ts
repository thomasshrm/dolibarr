// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { BASE_URL, login } from '../companies-helpers';

test.describe('Companies', () => {
  test('Acces a la zone Companies avec ou sans session', async ({ page }) => {
    // 1. Ouvrir `http://localhost/societe/index.php?mainmenu=companies` dans un nouveau contexte navigateur.
    await page.goto(`${BASE_URL}/societe/index.php?mainmenu=companies`);
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Third part(y|ies)/i);

    // 2. Se connecter avec un compte valide puis revenir sur l'URL.
    await login(page);
    await page.goto(`${BASE_URL}/societe/index.php?mainmenu=companies`);
    await expect(page).toHaveURL(/mainmenu=companies/);
    await expect(page.locator('body')).toContainText(/Third part(y|ies)/i);
    await expect(page.getByRole('link', { name: /Third party/i }).first()).toBeVisible();
  });
});
