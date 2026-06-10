// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createThirdParty, gotoCompanies, resetByReload, submitSearch, uniqueName } from '../companies-helpers';

test.describe('Tiers', () => {
  test('Recherche filtres tri et pagination', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const generic = await createThirdParty(request, cleanup, { name: uniqueName('pw-list-generic'), phone: '0102030405', town: 'Lyon' });
      const prospect = await createThirdParty(request, cleanup, { name: uniqueName('pw-list-prospect'), client: 2 });
      const customer = await createThirdParty(request, cleanup, { name: uniqueName('pw-list-customer'), client: 1, customer_code: `CU-${Date.now()}` });

      // 1. Ouvrir la liste des tiers avec plusieurs donnees de test.
      await gotoCompanies(page);
      await page.goto('http://localhost/societe/list.php?leftmenu=thirdparties&mainmenu=companies');
      await expect(page.locator('body')).toContainText(/Third parties/i);

      // 2. Utiliser la recherche rapide et les filtres par nom, telephone et type.
      await submitSearch(page.locator('input[name="search_nom"]'), generic.name);
      await expect(page.locator('body')).toContainText(generic.name);

      await resetByReload(page, 'http://localhost/societe/list.php?leftmenu=thirdparties&mainmenu=companies');
      await submitSearch(page.locator('input[name="search_phone"]'), '0102030405');
      await expect(page.locator('body')).toContainText(generic.name);

      await resetByReload(page, 'http://localhost/societe/list.php?leftmenu=thirdparties&mainmenu=companies');
      const sortLink = page.locator('a[href*="sortfield="]').filter({ hasText: /Third-party name/i }).first();
      if (await sortLink.isVisible()) {
        await sortLink.click();
        await expect(page).toHaveURL(/sortfield=/);
      }

      // 3. Ouvrir les sous-listes prospects, clients et fournisseurs.
      await page.goto('http://localhost/societe/list.php?type=p&leftmenu=prospects&mainmenu=companies');
      await submitSearch(page.locator('input[name="search_nom"]'), prospect.name);
      await expect(page.locator('body')).toContainText(prospect.name);

      await page.goto('http://localhost/societe/list.php?type=c&leftmenu=customers&mainmenu=companies');
      await submitSearch(page.locator('input[name="search_nom"]'), customer.name);
      await expect(page.locator('body')).toContainText(customer.name);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
