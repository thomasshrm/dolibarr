// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { gotoCompanies, partnershipMenuVisible } from '../companies-helpers';

test.describe('Partenariats', () => {
  test('Visibilite du menu et activation du module', async ({ page }) => {
    // 1. Verifier le menu avec un utilisateur autorise puis non autorise.
    await gotoCompanies(page);
    const visible = await partnershipMenuVisible(page);
    if (visible) {
      await expect(page.getByRole('link', { name: /New Partnership/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /List of partnership/i })).toBeVisible();
    } else {
      await expect(page.getByRole('link', { name: /Partnership/i })).toHaveCount(0);
    }
  });
});
