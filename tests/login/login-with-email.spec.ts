// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Connexion réussie', () => {
  test('Connexion avec adresse email à la place du nom d\'utilisateur', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Saisir l'adresse email associée au compte dans le champ 'username'
    // test_email_user est créé par seed.spec.ts avec email testuser@example.com
    await page.locator('#username').fill('testuser@example.com');
    await expect(page.locator('#username')).toHaveValue('testuser@example.com');

    // 3. Saisir le mot de passe correct dans le champ 'password'
    await page.locator('#password').fill('testpassword');

    // 4. Cliquer sur le bouton 'Connection'
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/mainmenu=home/);
    await expect(page.locator('.error, .login_error')).not.toBeVisible();
  });
});
