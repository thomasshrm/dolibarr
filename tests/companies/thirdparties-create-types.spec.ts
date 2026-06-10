// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, gotoCompanies, submitSearch, uniqueName } from '../companies-helpers';

async function createTypedThirdparty(page: import('@playwright/test').Page, name: string, linkName: RegExp): Promise<number | null> {
  await page.goto('http://localhost/societe/index.php?mainmenu=companies');
  await page.getByRole('link', { name: linkName }).click();
  await page.locator('#name').fill(name);
  await page.getByRole('button', { name: /Create third party/i }).click();
  await expect(page.locator('body')).toContainText(name);
  const match = page.url().match(/socid=(\d+)/);
  return match ? Number(match[1]) : null;
}

test.describe('Tiers', () => {
  test('Creation par type', async ({ page, request }) => {
    const cleanup = createCleanupBag();
    const prospect = uniqueName('pw-prospect');
    const customer = uniqueName('pw-customer');
    const vendor = uniqueName('pw-vendor');

    try {
      // 1. Creer un tiers prospect, un tiers client, un tiers fournisseur, puis un tiers mixte si la combinaison est autorisee.
      await gotoCompanies(page);
      const ids = [
        await createTypedThirdparty(page, prospect, /New Prospect/i),
        await createTypedThirdparty(page, customer, /New Customer/i),
        await createTypedThirdparty(page, vendor, /New Vendor/i),
      ].filter((value): value is number => value !== null);
      cleanup.thirdparties.push(...ids.reverse());

      await page.goto('http://localhost/societe/list.php?type=p&leftmenu=prospects&mainmenu=companies');
      await submitSearch(page.locator('input[name="search_nom"]'), prospect);
      await expect(page.locator('body')).toContainText(prospect);

      await page.goto('http://localhost/societe/list.php?type=c&leftmenu=customers&mainmenu=companies');
      await submitSearch(page.locator('input[name="search_nom"]'), customer);
      await expect(page.locator('body')).toContainText(customer);

      await page.goto('http://localhost/societe/list.php?type=f&leftmenu=suppliers&mainmenu=companies');
      await submitSearch(page.locator('input[name="search_nom"]'), vendor);
      await expect(page.locator('body')).toContainText(vendor);

      await page.goto('http://localhost/societe/card.php?action=create&mainmenu=companies');
      const customerCheckbox = page.locator('#customerinput');
      const supplierCheckbox = page.locator('#supplierinput');
      if (await customerCheckbox.isVisible() && await supplierCheckbox.isVisible()) {
        const mixed = uniqueName('pw-mixed');
        await page.locator('#name').fill(mixed);
        await customerCheckbox.check();
        await supplierCheckbox.check();
        await page.getByRole('button', { name: /Create third party/i }).click();
        await expect(page.locator('body')).toContainText(mixed);
        const match = page.url().match(/socid=(\d+)/);
        if (match) cleanup.thirdparties.unshift(Number(match[1]));
      }
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
