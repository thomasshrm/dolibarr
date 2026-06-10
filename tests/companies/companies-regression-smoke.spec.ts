// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createContact, createThirdParty, gotoCompanies, partnershipMenuVisible, uniqueName } from '../companies-helpers';

test.describe('Companies', () => {
  test('Smoke de regression sur le menu Companies', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const thirdparty = await createThirdParty(request, cleanup, { name: uniqueName('pw-smoke-thirdparty') });
      const contact = await createContact(request, cleanup, { socid: thirdparty.id, lastname: uniqueName('pw-smoke-contact') });

      // 1. Parcourir chaque entree majeure du menu gauche.
      await gotoCompanies(page);
      const destinations = [
        'http://localhost/societe/list.php?leftmenu=thirdparties&mainmenu=companies',
        'http://localhost/contact/list.php?leftmenu=contacts',
        `http://localhost/societe/contact.php?socid=${thirdparty.id}`,
        `http://localhost/contact/card.php?id=${contact.id}`,
      ];

      for (const url of destinations) {
        await page.goto(url);
        await expect(page.locator('body')).not.toContainText(/technical error|fatal error|warning:/i);
      }

      // 2. Creer un enregistrement valide dans chaque zone activee, le retrouver, le modifier puis verifier les liens croises.
      await page.goto(`http://localhost/contact/card.php?id=${contact.id}`);
      await expect(page.locator('body')).toContainText(thirdparty.name);

      // 3. Recharger les URL directes apres les operations.
      await page.reload();
      await expect(page.locator('body')).toContainText(contact.lastname);

      if (await partnershipMenuVisible(page)) {
        await page.goto('http://localhost/partnership/partnership_card.php?action=create&idmenu=237450&mainmenu=companies&leftmenu=');
        await expect(page.locator('body')).not.toContainText(/fatal error/i);
      }
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
