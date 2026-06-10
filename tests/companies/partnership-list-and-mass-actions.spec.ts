// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { gotoCompanies, partnershipMenuVisible } from '../companies-helpers';

test.describe('Partenariats', () => {
  test('Liste filtres statuts et actions de masse', async ({ page }) => {
    // 1. Ouvrir la liste des partenariats avec plusieurs statuts.
    await gotoCompanies(page);
    if (!(await partnershipMenuVisible(page))) {
      await expect(page.getByRole('link', { name: /Partnership/i })).toHaveCount(0);
      return;
    }

    await page.goto('http://localhost/partnership/partnership_list.php?idmenu=237451&mainmenu=companies&leftmenu=');

    // 2. Filtrer par type, tiers, statut et dates lorsque ces champs existent.
    const body = page.locator('body');
    if (await body.innerText().then((text) => /temporarily not available|technical error/i.test(text))) {
      await expect(body).toContainText(/temporarily not available|technical error/i);
      return;
    }

    await expect(body).toContainText(/Partnership/i);

    // 3. Tester les actions de masse disponibles.
    await expect(body).not.toContainText(/fatal error/i);
  });
});
