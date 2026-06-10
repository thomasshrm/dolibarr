// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createThirdParty, gotoCompanies, submitSearch, uniqueName } from '../companies-helpers';

test.describe('Contacts', () => {
  test('Creation d un contact rattache', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const thirdparty = await createThirdParty(request, cleanup, { name: uniqueName('pw-parent-company') });
      const lastname = uniqueName('pw-linked-contact');

      // 1. Ouvrir `Nouveau contact` et selectionner un tiers existant.
      await gotoCompanies(page);
      await page.goto('http://localhost/contact/card.php?leftmenu=contacts&action=create');
      await expect(page.locator('#lastname')).toBeVisible();
      await page.locator('#socid').selectOption(String(thirdparty.id));

      // 2. Saisir les champs requis et valides puis enregistrer.
      await page.locator('#lastname').fill(lastname);
      await page.locator('#firstname').fill('Playwright');
      await page.locator('#email').fill(`${lastname}@example.test`);
      await page.getByRole('button', { name: /^Add$/i }).click();
      await expect(page).toHaveURL(/\/contact\/card\.php\?id=\d+/);
      await expect(page.locator('body')).toContainText(lastname);

      const match = page.url().match(/id=(\d+)/);
      if (match) cleanup.contacts.push(Number(match[1]));

      await page.goto('http://localhost/contact/list.php?leftmenu=contacts');
      await submitSearch(page.locator('input[name="search_lastname"]'), lastname);
      await expect(page.locator('body')).toContainText(lastname);

      await page.goto(`http://localhost/societe/contact.php?socid=${thirdparty.id}`);
      await expect(page.locator('body')).toContainText(lastname);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
