// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, gotoCompanies, submitSearch, uniqueName } from '../companies-helpers';

test.describe('Contacts', () => {
  test('Creation d un contact non rattache', async ({ page, request }) => {
    const cleanup = createCleanupBag();
    const lastname = uniqueName('pw-other-contact');

    try {
      // 1. Tenter de creer un contact sans tiers si l'interface l'autorise.
      await gotoCompanies(page);
      await page.goto('http://localhost/contact/card.php?leftmenu=contacts&action=create');
      await page.locator('#lastname').fill(lastname);
      await page.locator('#firstname').fill('Other');
      await page.getByRole('button', { name: /^Add$/i }).click();

      // 2. Le contact n'est cree que si cette variante est supportee par l'environnement.
      if (/\/contact\/card\.php\?id=\d+/.test(page.url())) {
        const match = page.url().match(/id=(\d+)/);
        if (match) cleanup.contacts.push(Number(match[1]));
        await page.goto('http://localhost/contact/list.php?leftmenu=contacts&type=o');
        await submitSearch(page.locator('input[name="search_lastname"]'), lastname);
        await expect(page.locator('body')).toContainText(lastname);
      } else {
        await expect(page.locator('body')).toContainText(/third party|company|required|mandatory/i);
      }
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
