// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createContact, createThirdParty, gotoCompanies, submitSearch, uniqueName } from '../companies-helpers';

test.describe('Contacts', () => {
  test('Recherche filtres et vues de contacts', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const customer = await createThirdParty(request, cleanup, { name: uniqueName('pw-contact-customer'), client: 1, customer_code: `CU-${Date.now()}` });
      const other = await createContact(request, cleanup, { lastname: uniqueName('pw-contact-other') });
      const linked = await createContact(request, cleanup, { lastname: uniqueName('pw-contact-linked'), socid: customer.id, email: 'linked@example.test' });

      // 1. Ouvrir la liste principale puis les sous-listes prospects, clients, fournisseurs et autres.
      await gotoCompanies(page);
      await page.goto('http://localhost/contact/list.php?leftmenu=contacts');
      await expect(page.locator('body')).toContainText(/Contacts\/Addresses/i);

      // 2. Filtrer par nom, societe et statut selon les champs presents.
      await submitSearch(page.locator('input[name="search_lastname"]'), linked.lastname);
      await expect(page.locator('body')).toContainText(linked.lastname);

      await page.goto('http://localhost/contact/list.php?leftmenu=contacts&type=c');
      await submitSearch(page.locator('input[name="search_societe"]'), customer.name);
      await expect(page.locator('body')).toContainText(linked.lastname);

      await page.goto('http://localhost/contact/list.php?leftmenu=contacts&type=o');
      await submitSearch(page.locator('input[name="search_lastname"]'), other.lastname);
      await expect(page.locator('body')).toContainText(other.lastname);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
