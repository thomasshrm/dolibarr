// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Échec de connexion - Identifiants incorrects', () => {
  test('Connexion avec un identifiant inexistant', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Saisir un identifiant inexistant dans le champ 'username'
    await page.locator('#username').fill('utilisateur_inexistant_xyz');

    // 3. Saisir n'importe quel mot de passe
    await page.locator('#password').fill('anypassword');

    // 4. Cliquer sur le bouton 'Connection'
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/index\.php/);
    // Le message d'erreur doit être identique à celui d'un mauvais mot de passe (pas de discrimination)
    await expect(page.locator('.error, .login_error, div[class*="error"]')).toBeVisible();
  });
});
