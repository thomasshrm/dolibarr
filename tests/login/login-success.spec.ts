// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Connexion réussie', () => {
  test('Connexion avec identifiant et mot de passe valides', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page).toHaveTitle(/Login/i);
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();

    // 2. Saisir un identifiant valide (ex: admin) dans le champ 'username'
    await page.locator('#username').fill('admin');
    await expect(page.locator('#username')).toHaveValue('admin');

    // 3. Saisir le mot de passe correct dans le champ 'password'
    await page.locator('#password').fill('admin');
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');

    // 4. Cliquer sur le bouton 'Connection'
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/mainmenu=home/);
    await expect(page.locator('.error, .login_error')).not.toBeVisible();
  });
});
