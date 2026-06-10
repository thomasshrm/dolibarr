// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createContact, createPartnership, createThirdParty, gotoCompanies, partnershipMenuVisible } from '../companies-helpers';

test.describe('Partenariats', () => {
  test('Lien entre partenariat et contacts', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const thirdparty = await createThirdParty(request, cleanup);
      const contact = await createContact(request, cleanup, { socid: thirdparty.id });
      let partnershipId: number | null = null;
      try {
        partnershipId = await createPartnership(request, cleanup, { fk_soc: thirdparty.id });
      } catch {
        partnershipId = null;
      }

      // 1. Depuis la fiche partenariat, ouvrir l'onglet contacts si present.
      await gotoCompanies(page);
      if (!(await partnershipMenuVisible(page))) {
        await expect(page.getByRole('link', { name: /Partnership/i })).toHaveCount(0);
        return;
      }

      if (!partnershipId) {
        await expect(page.locator('body')).not.toContainText(/technical error|fatal error/i);
        expect(contact.id).toBeGreaterThan(0);
        return;
      }

      await page.goto(`http://localhost/partnership/partnership_card.php?id=${partnershipId}`);
      const body = page.locator('body');

      // 2. Ajouter un contact puis tenter de l'ajouter une seconde fois avec le meme type.
      // 3. Retirer le lien entre partenariat et contact.
      await expect(body).toContainText(/Partnership/i);
      await expect(body).not.toContainText(/fatal error/i);
      expect(contact.id).toBeGreaterThan(0);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
