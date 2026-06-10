// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, gotoCompanies, submitSearch, uniqueName } from '../companies-helpers';

test.describe('Tiers', () => {
  test('Creation d un tiers generique', async ({ page, request }) => {
    const cleanup = createCleanupBag();
    const name = uniqueName('pw-generic-thirdparty');

    try {
      // 1. Ouvrir `Nouveau tiers`.
      await gotoCompanies(page);
      await page.getByRole('link', { name: /New Third Party/i }).click();
      await expect(page.locator('#name')).toBeVisible();

      // 2. Saisir un nom unique et les donnees minimales valides, puis enregistrer.
      await page.locator('#name').fill(name);
      await page.locator('#town').fill('Paris');
      await page.locator('#email').fill(`${name}@example.test`);
      await page.getByRole('button', { name: /Create third party/i }).click();
      await expect(page).toHaveURL(/socid=\d+/);
      await expect(page.locator('body')).toContainText(name);

      const match = page.url().match(/socid=(\d+)/);
      if (match) cleanup.thirdparties.push(Number(match[1]));

      await page.goto('http://localhost/societe/list.php?leftmenu=thirdparties&mainmenu=companies');
      await submitSearch(page.locator('input[name="search_nom"]'), name);
      await expect(page.locator('body')).toContainText(name);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
