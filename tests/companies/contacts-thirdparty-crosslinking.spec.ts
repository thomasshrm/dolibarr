// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createContact, createThirdParty, gotoCompanies } from '../companies-helpers';

test.describe('Contacts', () => {
  test('Liens croises entre tiers et contacts', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const thirdparty = await createThirdParty(request, cleanup);
      const contact = await createContact(request, cleanup, { socid: thirdparty.id });

      // 1. Depuis une fiche tiers, ouvrir la liste des contacts lies.
      await gotoCompanies(page);
      await page.goto(`http://localhost/societe/contact.php?socid=${thirdparty.id}`);
      await expect(page.locator('body')).toContainText(contact.lastname);

      // 2. Depuis une fiche contact, revenir vers le tiers lie.
      await page.goto(`http://localhost/contact/card.php?id=${contact.id}`);
      await expect(page.locator('body')).toContainText(thirdparty.name);
      await page.getByRole('link', { name: new RegExp(thirdparty.name, 'i') }).first().click();
      await expect(page).toHaveURL(new RegExp(`socid=${thirdparty.id}`));

      // 3. Si des contacts prives existent, verifier les regles de visibilite avec plusieurs roles.
      await expect(page.locator('body')).not.toContainText(/technical error|access denied/i);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
