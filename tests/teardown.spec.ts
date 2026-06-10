import { test, request as playwrightRequest } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost';
const ADMIN_API_KEY = process.env.DOLI_ADMIN_API_KEY ?? 'demokey';
const STATE_FILE = path.join(__dirname, '.test-state.json');

test('teardown', async () => {
  if (!fs.existsSync(STATE_FILE)) {
    return;
  }

  const state: Record<string, number> = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));

  const apiContext = await playwrightRequest.newContext();
  const headers = { DOLAPIKEY: ADMIN_API_KEY };

  // Delete created users
  for (const [key, id] of Object.entries(state)) {
    if (id) {
      await apiContext.delete(`${BASE_URL}/api/index.php/users/${id}`, { headers });
    }
  }

  fs.unlinkSync(STATE_FILE);
  await apiContext.dispose();
});
