// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { gotoCompanies, uniqueName } from '../companies-helpers';

test.describe('Tiers', () => {
  test('Validation des champs tiers', async ({ page }) => {
    // 1. Tenter d'enregistrer un tiers sans nom.
    await gotoCompanies(page);
    await page.goto('http://localhost/societe/card.php?action=create&mainmenu=companies');
    await page.getByRole('button', { name: /Create third party/i }).click();
    await expect(page.locator('body')).toContainText(/required|mandatory|name/i);

    // 2. Tenter d'enregistrer un tiers avec un email invalide et une URL invalide.
    await page.locator('#name').fill(uniqueName('pw-invalid-thirdparty'));
    await page.locator('#email').fill('invalid-email');
    await page.locator('#url').fill('not-a-url');
    await page.getByRole('button', { name: /Create third party/i }).click();
    await expect(page).toHaveURL(/\/societe\/card\.php/);
    await expect(page.locator('body')).toContainText(/email|url|invalid|format/i);

    // 3. Si le parametrage le permet, tester les options liees au mailing et au `No Email`.
    const noEmail = page.locator('#no_email');
    if (await noEmail.isVisible()) {
      await noEmail.selectOption('1');
      await page.locator('#email').fill('');
      await page.locator('#url').fill('');
      await page.getByRole('button', { name: /Create third party/i }).click();
      await expect(page.locator('body')).not.toContainText(/fatal error|technical error/i);
    }
  });
});
