import { test, expect, request as playwrightRequest } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost';
const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'admin';
const STATE_FILE = path.join(__dirname, '.test-state.json');

test.describe('Test group', () => {
  test('seed', async () => {
    const apiContext = await playwrightRequest.newContext();

    // 1. Get API token via login
    const loginRes = await apiContext.post(`${BASE_URL}/api/index.php/login`, {
      data: { login: ADMIN_LOGIN, password: ADMIN_PASSWORD },
    });
    expect(loginRes.ok(), 'API login should succeed').toBeTruthy();
    const loginData = await loginRes.json();
    const apiToken: string = loginData.success.token;
    const headers = { DOLAPIKEY: apiToken };

    const createdIds: Record<string, number> = {};

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
