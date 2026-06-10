// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { BASE_URL, gotoCompanies, login } from '../companies-helpers';

const readonlyLogin = process.env.DOLI_READONLY_LOGIN;
const readonlyPassword = process.env.DOLI_READONLY_PASSWORD;
const editorLogin = process.env.DOLI_EDITOR_LOGIN;
const editorPassword = process.env.DOLI_EDITOR_PASSWORD;

test.describe('Permissions', () => {
  test('Couverture par roles', async ({ browser, page }) => {
    // 1. Rejouer la navigation principale avec un profil lecture seule, un profil edition et un profil administrateur.
    await gotoCompanies(page);
    await expect(page.getByRole('link', { name: /New Third Party/i })).toBeVisible();

    if (editorLogin && editorPassword) {
      const context = await browser.newContext();
      const editorPage = await context.newPage();
      await login(editorPage, editorLogin, editorPassword);
      await editorPage.goto(`${BASE_URL}/societe/index.php?mainmenu=companies`);
      await expect(editorPage.locator('body')).not.toContainText(/access denied/i);
      await context.close();
    }

    if (readonlyLogin && readonlyPassword) {
      const context = await browser.newContext();
      const readonlyPage = await context.newPage();
      await login(readonlyPage, readonlyLogin, readonlyPassword);
      await readonlyPage.goto(`${BASE_URL}/societe/index.php?mainmenu=companies`);
      await expect(readonlyPage.locator('body')).not.toContainText(/technical error/i);
      await context.close();
    }
  });
});
