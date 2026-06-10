// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { gotoCompanies } from '../companies-helpers';

test.describe('Companies', () => {
  test('Presence des entrees de menu', async ({ page }) => {
    // 1. Inspecter le menu de gauche depuis la zone `Companies`.
    await gotoCompanies(page);
    await expect(page.getByRole('link', { name: /Third party/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Contacts\/Addresses/i }).first()).toBeVisible();

    // 2. Ouvrir chaque groupe fonctionnel visible.
    await expect(page.getByRole('link', { name: /New Third Party/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^List$/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Prospects/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Customers/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Vendors/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /New Contact\/Address/i })).toBeVisible();

    const partnershipLink = page.getByRole('link', { name: /Partnership/i }).first();
    if (await partnershipLink.isVisible()) {
      await expect(page.getByRole('link', { name: /New Partnership/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /List of partnership/i })).toBeVisible();
    }
  });
});
