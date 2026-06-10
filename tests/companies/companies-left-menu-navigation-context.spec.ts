// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { gotoCompanies } from '../companies-helpers';

test.describe('Companies', () => {
  test('Navigation entre les entrees du menu gauche', async ({ page }) => {
    // 1. Ouvrir successivement les entrees visibles du menu gauche.
    await gotoCompanies(page);

    const urls = [
      { name: /List$/i, url: /\/societe\/list\.php/ },
      { name: /New Contact\/Address/i, url: /\/contact\/card\.php/ },
      { name: /Customers/i, url: /type=c/ },
    ];

    for (const item of urls) {
      await page.getByRole('link', { name: item.name }).first().click();
      await expect(page).toHaveURL(item.url);
      await expect(page.locator('body')).not.toContainText(/technical error|temporarily not available/i);
      await page.goBack();
      await expect(page).toHaveURL(/mainmenu=companies/);
      await page.goForward();
      await expect(page).toHaveURL(item.url);
      await page.goto('http://localhost/societe/index.php?mainmenu=companies');
    }
  });
});
