// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Connexion réussie', () => {
  test('Redirection vers la page d\'origine après connexion (paramètre backtopage)', async ({ page }) => {
    // 1. Naviguer vers une URL protégée qui déclenche une redirection vers la page de connexion avec le paramètre backtopage
    await page.goto('http://localhost/societe/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Saisir un identifiant valide et le mot de passe correct
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('admin');

    // 3. Cliquer sur le bouton 'Connection'
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/societe\/index\.php/);
  });
});
