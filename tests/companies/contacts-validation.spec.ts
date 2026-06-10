// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { gotoCompanies, uniqueName } from '../companies-helpers';

test.describe('Contacts', () => {
  test('Validation des champs obligatoires des contacts', async ({ page }) => {
    // 1. Tenter d'enregistrer un contact sans nom/libelle.
    await gotoCompanies(page);
    await page.goto('http://localhost/contact/card.php?leftmenu=contacts&action=create');
    await page.getByRole('button', { name: /^Add$/i }).click();
    await expect(page.locator('body')).toContainText(/required|mandatory|last name|name/i);

    // 2. Tenter d'enregistrer un contact avec un email invalide.
    await page.locator('#lastname').fill(uniqueName('pw-invalid-contact'));
    await page.locator('#email').fill('not-an-email');
    await page.getByRole('button', { name: /^Add$/i }).click();
    await expect(page.locator('body')).toContainText(/email|invalid|format/i);

    // 3. Si applicable, tester les regles liees a l'emailing.
    const noEmail = page.locator('#no_email');
    if (await noEmail.isVisible()) {
      await noEmail.selectOption('1');
      await page.locator('#email').fill('');
      await page.getByRole('button', { name: /^Add$/i }).click();
      await expect(page.locator('body')).not.toContainText(/technical error|fatal error/i);
    }
  });
});
