// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Échec de connexion - Identifiants incorrects', () => {
  test('Connexion avec un compte utilisateur désactivé (statut = 0)', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Saisir l'identifiant du compte désactivé (créé par seed.spec.ts)
    await page.locator('#username').fill('disabled_user');

    // 3. Saisir le mot de passe correct du compte désactivé
    await page.locator('#password').fill('testpassword');

    // 4. Cliquer sur le bouton 'Connection'
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/index\.php/);
    await expect(page.locator('.error, .login_error, div[class*="error"]')).toBeVisible();
  });
});
