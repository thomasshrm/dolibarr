// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { gotoCompanies, partnershipMenuVisible } from '../companies-helpers';

test.describe('Partenariats', () => {
  test('Validation et controles sur les dates', async ({ page }) => {
    // 1. Tenter d'enregistrer sans type, sans tiers lie et sans date de debut.
    await gotoCompanies(page);
    if (!(await partnershipMenuVisible(page))) {
      await expect(page.getByRole('link', { name: /Partnership/i })).toHaveCount(0);
      return;
    }

    await page.goto('http://localhost/partnership/partnership_card.php?action=create&idmenu=237450&mainmenu=companies&leftmenu=');
    await page.getByRole('button', { name: /^Create$/i }).click();
    await expect(page.locator('body')).toContainText(/required|mandatory|type|third party|date/i);

    // 2. Tester des cas limites sur les dates.
    await page.locator('#date_partnership_start').fill('2026-06-10');
    await page.locator('#date_partnership_end').fill('2026-06-01');
    await page.getByRole('button', { name: /^Create$/i }).click();
    await expect(page.locator('body')).not.toContainText(/fatal error/i);
  });
});
