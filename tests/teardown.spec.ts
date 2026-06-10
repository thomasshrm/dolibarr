import { test, request as playwrightRequest } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost';
const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'admin';
const STATE_FILE = path.join(__dirname, '.test-state.json');

test('teardown', async () => {
  if (!fs.existsSync(STATE_FILE)) {
    return;
  }

  const state: Record<string, number> = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));

  const apiContext = await playwrightRequest.newContext();

  // Get API token
  const loginRes = await apiContext.post(`${BASE_URL}/api/index.php/login`, {
    data: { login: ADMIN_LOGIN, password: ADMIN_PASSWORD },
  });
  const loginData = await loginRes.json();
  const headers = { DOLAPIKEY: loginData.success.token as string };

  // Delete created users
  for (const [key, id] of Object.entries(state)) {
    if (id) {
      await apiContext.delete(`${BASE_URL}/api/index.php/users/${id}`, { headers });
    }
  }

  fs.unlinkSync(STATE_FILE);
  await apiContext.dispose();
});
