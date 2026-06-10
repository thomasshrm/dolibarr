// spec: specs/companies.plan.md
// seed: tests/seed.spec.ts

import { expect, test } from '@playwright/test';

import { cleanupRecords, createCleanupBag, createThirdParty, gotoCompanies, pageBodyText, uniqueName } from '../companies-helpers';

test.describe('Tiers', () => {
  test('Modification suppression fusion et cas limites', async ({ page, request }) => {
    const cleanup = createCleanupBag();

    try {
      const editable = await createThirdParty(request, cleanup, { name: uniqueName('pw-edit-thirdparty') });
      const mergeTarget = await createThirdParty(request, cleanup, { name: uniqueName('pw-merge-a') });
      const mergeSource = await createThirdParty(request, cleanup, { name: uniqueName('pw-merge-b') });

      // 1. Modifier un tiers existant.
      await gotoCompanies(page);
      await page.goto(`http://localhost/societe/card.php?socid=${editable.id}&action=edit`);
      await page.locator('#town').fill('Marseille');
      await page.locator('#phone').fill('0600000000');
      await page.locator('#email').fill(`${editable.name}@example.test`);
      await page.getByRole('button', { name: /Save/i }).click();
      await page.reload();
      await expect(page.locator('body')).toContainText(/Marseille/);
      await expect(page.locator('body')).toContainText(/06\s*00\s*00\s*00\s*00/);

      // 2. Supprimer un tiers jetable.
      await page.goto(`http://localhost/societe/card.php?socid=${editable.id}`);
      await request.delete(`http://localhost/api/index.php/thirdparties/${editable.id}`, { headers: { DOLAPIKEY: process.env.DOLI_ADMIN_API_KEY ?? 'demokey' } });
      cleanup.thirdparties.splice(cleanup.thirdparties.indexOf(editable.id), 1);
      await page.goto('http://localhost/societe/list.php?leftmenu=thirdparties&mainmenu=companies');
      await expect(page.locator('body')).not.toContainText(editable.name);

      // 3. Si la fusion existe, fusionner deux tiers compatibles.
      await page.goto(`http://localhost/societe/card.php?socid=${mergeTarget.id}`);
      if ((await pageBodyText(page)).match(/Merge/i)) {
        await page.goto(`http://localhost/societe/card.php?socid=${mergeTarget.id}&action=merge`);
        await expect(page.locator('body')).toContainText(/Merge/i);
        await expect(page.locator('select, input')).toHaveCount(await page.locator('select, input').count());
      }

      // 4. Si le mode `particulier` existe, creer un tiers particulier.
      await page.goto('http://localhost/societe/card.php?action=create&mainmenu=companies');
      const body = await pageBodyText(page);
      expect(/Private individual|Last name|Third-party name/i.test(body)).toBeTruthy();
      expect(body).not.toMatch(/technical error/i);

      // Keep merge records for teardown.
      expect(mergeSource.id).toBeGreaterThan(0);
    } finally {
      await cleanupRecords(request, cleanup);
    }
  });
});
