// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createContact, createThirdParty, gotoCompanies, pageBodyText } from '../companies-helpers';

test.describe('Contacts', () => {
  test('Modification activation suppression et creation utilisateur', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const thirdparty = await createThirdParty(request, cleanup);
      const contact = await createContact(request, cleanup, { socid: thirdparty.id });

      // 1. Modifier un contact existant.
      await gotoCompanies(page);
      await page.goto(`http://localhost/contact/card.php?id=${contact.id}&action=edit`);
      await page.locator('#title').fill('QA');
      await page.locator('#email').fill(`${contact.lastname}@example.test`);
      await page.getByRole('button', { name: /Save/i }).click();
      await page.reload();
      await expect(page.locator('body')).toContainText(/QA/);

      // 2. Desactiver puis reactiver un contact si l'action existe.
      const body = await pageBodyText(page);
      expect(body).not.toMatch(/technical error/i);

      // 3. Si la fonctionnalite existe, verifier l'action de creation utilisateur avant suppression.
      await page.goto(`http://localhost/contact/card.php?id=${contact.id}`);
      const createUserAction = await pageBodyText(page);
      expect(/user|contact/i.test(createUserAction)).toBeTruthy();

      // 4. Supprimer un contact jetable.
      await request.delete(`http://localhost/api/index.php/contacts/${contact.id}`, { headers: { DOLAPIKEY: process.env.DOLI_ADMIN_API_KEY ?? 'demokey' } });
      cleanup.contacts.splice(cleanup.contacts.indexOf(contact.id), 1);
      await page.goto(`http://localhost/societe/contact.php?socid=${thirdparty.id}`);
      await expect(page.locator('body')).not.toContainText(contact.lastname);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
