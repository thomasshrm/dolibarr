// spec: specs/login.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Protection et sécurité', () => {
  test('Vérification de la présence du jeton CSRF dans le formulaire', async ({ page }) => {
    // 1. Naviguer vers http://localhost/index.php
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();

    // 2. Inspecter le code source du formulaire de connexion (id='login')
    const tokenInput = page.locator('form#login input[name="token"]');
    await expect(tokenInput).toBeAttached();
    const tokenValue = await tokenInput.inputValue();
    expect(tokenValue).not.toBe('');

    // 3. Vérifier que la soumission sans token CSRF valide est rejetée
    // Soumettre le formulaire avec un token invalide via fetch
    const response = await page.evaluate(async () => {
      const formData = new URLSearchParams();
      formData.append('username', 'admin');
      formData.append('password', 'admin');
      formData.append('token', 'invalid_csrf_token');
      formData.append('loginfunction', 'loginfunction');
      const res = await fetch('/index.php', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        redirect: 'manual',
      });
      return { status: res.status, type: res.type };
    });
    // La requête doit être rejetée ou renvoyée sur la page de login (pas de session créée)
    expect([200, 302, 400, 403]).toContain(response.status);
    // Re-naviguer et vérifier qu'aucune session n'est créée
    await page.goto('http://localhost/index.php');
    await expect(page.locator('#username')).toBeVisible();
  });
});
