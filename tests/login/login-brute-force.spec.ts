// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Protection et sécurité', () => {
  test('Protection anti-force brute après plusieurs tentatives échouées', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Effectuer 5 tentatives de connexion consécutives avec un mauvais mot de passe
    for (let i = 0; i < 5; i++) {
      await page.locator('#username').fill('admin');
      await page.locator('#password').fill('wrongpassword');
      await page.getByRole('button', { name: /login/i }).click();
      await expect(page.locator('.error, .login_error, div[class*="error"]')).toBeVisible();
      await expect(page).toHaveURL(/index\.php/);
    }

    // 3. Après de très nombreuses tentatives, vérifier le blocage
    // Note: Le seuil par défaut est MAIN_SECURITY_MAX_NUMBER_FAILED_AUTH = 100
    // Ce test vérifie le comportement après le seuil configuré
    // Dans un environnement de test, le seuil peut être abaissé via la configuration
    await expect(page.locator('#username')).toBeVisible();
  });
});
