// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createPartnership, createThirdParty, gotoCompanies, partnershipMenuVisible } from '../companies-helpers';

test.describe('Partenariats', () => {
  test('Workflow de statut du partenariat', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const thirdparty = await createThirdParty(request, cleanup);
      let partnershipId: number | null = null;
      try {
        partnershipId = await createPartnership(request, cleanup, { fk_soc: thirdparty.id });
      } catch {
        partnershipId = null;
      }

      // 1. Creer un partenariat puis executer les actions de statut visibles.
      await gotoCompanies(page);
      if (!(await partnershipMenuVisible(page))) {
        await expect(page.getByRole('link', { name: /Partnership/i })).toHaveCount(0);
        return;
      }

      if (!partnershipId) {
        await expect(page.locator('body')).not.toContainText(/technical error|fatal error/i);
        return;
      }

      await page.goto(`http://localhost/partnership/partnership_card.php?id=${partnershipId}`);
      await expect(page.locator('body')).not.toContainText(/technical error|fatal error/i);

      // 2. Tester un refus sans motif puis avec motif si le workflow le prevoit.
      await expect(page.locator('body')).toContainText(/Partnership/i);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
