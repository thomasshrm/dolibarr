import { test, expect, request as playwrightRequest } from '@playwright/test';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost';
const ADMIN_API_KEY = process.env.DOLI_ADMIN_API_KEY ?? 'demokey';
const STATE_FILE = path.join(__dirname, '.test-state.json');

test.describe('Test group', () => {
  test('seed', async () => {
    const apiContext = await playwrightRequest.newContext();
    const headers = { DOLAPIKEY: ADMIN_API_KEY };

    const createdIds: Record<string, number> = {};

    // Clear login throttling from previous failed runs.
    execSync(
      'docker exec "dolibarr-mariadb" mariadb -u"dolidbuser" -p"dolidbSecretPassword" "dolidb" -e "DELETE FROM llx_events WHERE type=\'USER_LOGIN_FAILED\';"',
      { stdio: 'ignore' }
    );

    // Clean up any leftover users from a previous failed run
    for (const login of ['test_email_user', 'disabled_user']) {
      const searchRes = await apiContext.get(`${BASE_URL}/api/index.php/users`, {
        headers,
        params: { sqlfilters: `(t.login:=:'${login}')` },
      });
      if (searchRes.ok()) {
        const existing = await searchRes.json();
        if (Array.isArray(existing) && existing.length > 0) {
          await apiContext.delete(`${BASE_URL}/api/index.php/users/${existing[0].id}`, { headers });
        }
      }
    }

    // 2. Create test user with email (for login-with-email test)
    const emailUserRes = await apiContext.post(`${BASE_URL}/api/index.php/users`, {
      headers,
      data: {
        login: 'test_email_user',
        lastname: 'Email',
        firstname: 'Test',
        email: 'testuser@example.com',
        pass: 'testpassword',
        statut: 1,
      },
    });
    expect(emailUserRes.ok(), 'test_email_user creation should succeed').toBeTruthy();
    createdIds.emailUserId = await emailUserRes.json();

    // 3. Create disabled user (for login-disabled-user test)
    const disabledUserRes = await apiContext.post(`${BASE_URL}/api/index.php/users`, {
      headers,
      data: {
        login: 'disabled_user',
        lastname: 'Disabled',
        firstname: 'Test',
        pass: 'testpassword',
        statut: 1,
      },
    });
    expect(disabledUserRes.ok(), 'disabled_user creation should succeed').toBeTruthy();
    createdIds.disabledUserId = await disabledUserRes.json();

    // 4. Disable the user (statut must be set via PUT after creation)
    const disableRes = await apiContext.put(
      `${BASE_URL}/api/index.php/users/${createdIds.disabledUserId}`,
      { headers, data: { statut: 0 } }
    );
    expect(disableRes.ok(), 'disabled_user status update should succeed').toBeTruthy();

    // 5. Persist created IDs for teardown
    fs.writeFileSync(STATE_FILE, JSON.stringify(createdIds, null, 2));

    await apiContext.dispose();
  });
});
