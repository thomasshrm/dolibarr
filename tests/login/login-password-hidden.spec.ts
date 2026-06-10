// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Protection et sécurité', () => {
  test('Le mot de passe ne doit pas être visible en texte clair dans le DOM', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Vérifier l'attribut 'type' du champ de mot de passe dans le DOM
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');

    // 3. Saisir un mot de passe dans le champ password
    await page.locator('#password').fill('mysecretpassword');
    // Le champ doit toujours être de type 'password' (caractères masqués)
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });
});
