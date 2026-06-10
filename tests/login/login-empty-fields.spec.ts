// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Échec de connexion - Identifiants incorrects', () => {
  test('Connexion avec les champs identifiant et mot de passe vides', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Ne rien saisir dans les champs 'username' et 'password'
    // (les champs restent vides)

    // 3. Cliquer sur le bouton 'Connection'
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/index\.php/);
    // With empty credentials, Dolibarr does not set an error session message (auth loop is skipped
    // when username is empty). The login page simply re-renders — verify the form is still visible
    // and no redirection to the dashboard occurred.
    await expect(page.locator('#username')).toBeVisible();
  });
});
