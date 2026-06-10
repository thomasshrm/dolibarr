// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Échec de connexion - Identifiants incorrects', () => {
  test('Connexion avec un mot de passe incorrect', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Saisir un identifiant valide dans le champ 'username'
    await page.locator('#username').fill('admin');

    // 3. Saisir un mot de passe incorrect dans le champ 'password'
    await page.locator('#password').fill('wrongpassword');

    // 4. Cliquer sur le bouton 'Connection'
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/index\.php/);
    await expect(page.locator('.error, .login_error, div[class*="error"]')).toBeVisible();
    await expect(page.locator('#username')).toHaveValue('admin');
    await expect(page.locator('#password')).toHaveValue('');
  });
});
