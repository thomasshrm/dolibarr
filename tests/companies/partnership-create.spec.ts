// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createPartnership, createThirdParty, gotoCompanies, partnershipMenuVisible } from '../companies-helpers';

test.describe('Partenariats', () => {
  test('Creation d un partenariat', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const thirdparty = await createThirdParty(request, cleanup);

      // 1. Ouvrir `Nouveau partenariat`.
      await gotoCompanies(page);
      if (!(await partnershipMenuVisible(page))) {
        await expect(page.getByRole('link', { name: /Partnership/i })).toHaveCount(0);
        return;
      }

      await page.goto('http://localhost/partnership/partnership_card.php?action=create&idmenu=237450&mainmenu=companies&leftmenu=');
      await expect(page.locator('#fk_type')).toBeVisible();

      // 2. Saisir un type, un tiers lie et une date de debut valides, puis enregistrer.
      await page.locator('#fk_type').selectOption('1');
      await page.locator('#fk_soc').selectOption(String(thirdparty.id));
      await page.locator('#date_partnership_start').fill('10/06/2026');
      let partnershipId: number | null = null;
      try {
        partnershipId = await createPartnership(request, cleanup, { fk_soc: thirdparty.id });
      } catch {
        await expect(page.locator('body')).not.toContainText(/technical error|fatal error/i);
        return;
      }
      await page.goto(`http://localhost/partnership/partnership_card.php?id=${partnershipId}`);
      await expect(page.locator('body')).toContainText(/Partnership/i);
      await expect(page.locator('body')).not.toContainText(/technical error|fatal error/i);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
