// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Connexion réussie', () => {
  test('Connexion en soumettant le formulaire avec la touche Entrée', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Saisir un identifiant valide dans le champ 'username'
    await page.locator('#username').fill('admin');

    // 3. Saisir le mot de passe correct dans le champ 'password'
    await page.locator('#password').fill('admin');

    // 4. Appuyer sur la touche Entrée
    await page.locator('#password').press('Enter');
    await expect(page).toHaveURL(/mainmenu=home/);
  });
});
