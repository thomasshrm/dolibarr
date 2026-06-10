// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Protection et sécurité', () => {
  test('Affichage/masquage du mot de passe avec l\'icône œil', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Saisir un mot de passe dans le champ 'password'
    await page.locator('#password').fill('mysecretpassword');
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');

    // 3. Cliquer sur l'icône 'œil' (togglepassword) à côté du champ de mot de passe
    await page.locator('#togglepassword, [id*="togglepassword"], [onclick*="togglepassword"]').click();
    await expect(page.locator('#password')).toHaveAttribute('type', 'text');
  });
});
