import { APIRequestContext, expect, Locator, Page } from '@playwright/test';

export const BASE_URL = 'http://localhost';
const ADMIN_API_KEY = process.env.DOLI_ADMIN_API_KEY ?? 'demokey';
const ADMIN_LOGIN = process.env.DOLI_ADMIN_LOGIN ?? 'admin';
const ADMIN_PASSWORD = process.env.DOLI_ADMIN_PASSWORD ?? 'admin';

export type CleanupBag = {
  partnerships: number[];
  contacts: number[];
  thirdparties: number[];
};

export function createCleanupBag(): CleanupBag {
  return { partnerships: [], contacts: [], thirdparties: [] };
}

export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function login(page: Page, loginName = ADMIN_LOGIN, password = ADMIN_PASSWORD): Promise<void> {
  await page.goto(`${BASE_URL}/index.php`);

  const loginField = page.locator('#username');
  if (await loginField.isVisible()) {
    await loginField.fill(loginName);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: /login/i }).click();
  }

  await expect(page).toHaveURL(/index\.php\?mainmenu=home|mainmenu=home/);
  await expect(page.locator('body')).not.toContainText(/too many attempts/i);
}

export async function gotoCompanies(page: Page): Promise<void> {
  await login(page);
  await page.goto(`${BASE_URL}/societe/index.php?mainmenu=companies`);
  await expect(page).toHaveURL(/mainmenu=companies/);
  await expect(page.locator('body')).toContainText(/Third part(y|ies)/i);
}

export async function expectNoTechnicalError(page: Page): Promise<void> {
  await expect(page.locator('body')).not.toContainText(/temporarily not available|technical error|fatal error|warning:/i);
}

export function apiHeaders(): Record<string, string> {
  return { DOLAPIKEY: ADMIN_API_KEY };
}

export async function apiPost(request: APIRequestContext, path: string, data: unknown): Promise<any> {
  const response = await request.post(`${BASE_URL}/api/index.php${path}`, {
    headers: apiHeaders(),
    data,
  });
  expect(response.ok(), `POST ${path} should succeed`).toBeTruthy();
  return response.json();
}

export async function apiPut(request: APIRequestContext, path: string, data: unknown): Promise<any> {
  const response = await request.put(`${BASE_URL}/api/index.php${path}`, {
    headers: apiHeaders(),
    data,
  });
  expect(response.ok(), `PUT ${path} should succeed`).toBeTruthy();
  return response.json();
}

export async function apiDelete(request: APIRequestContext, path: string): Promise<void> {
  let lastStatus = 0;
  let lastBody = '';

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await request.delete(`${BASE_URL}/api/index.php${path}`, {
      headers: apiHeaders(),
    });
    lastStatus = response.status();
    lastBody = await response.text();

    if ([200, 204, 404, 409].includes(lastStatus)) {
      return;
    }

    if (lastStatus !== 500 || attempt === 2) {
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
  }

  expect(
    [200, 204, 404, 409],
    `DELETE ${path} should succeed, got ${lastStatus}: ${lastBody}`,
  ).toContain(lastStatus);
}

export async function createThirdParty(
  request: APIRequestContext,
  cleanup: CleanupBag,
  overrides: Record<string, unknown> = {},
): Promise<{ id: number; name: string }> {
  const name = (overrides.name as string) ?? uniqueName('pw-thirdparty');
  const client = overrides.client as number | undefined;
  const fournisseur = overrides.fournisseur as number | undefined;
  const id = await apiPost(request, '/thirdparties', {
    name,
    country_code: 'FR',
    ...(client && !overrides.code_client && !overrides.customer_code ? { code_client: 'auto' } : {}),
    ...(fournisseur && !overrides.code_fournisseur && !overrides.supplier_code ? { code_fournisseur: 'auto' } : {}),
    ...(overrides.customer_code && !overrides.code_client ? { code_client: overrides.customer_code } : {}),
    ...(overrides.supplier_code && !overrides.code_fournisseur ? { code_fournisseur: overrides.supplier_code } : {}),
    ...overrides,
  });
  cleanup.thirdparties.unshift(Number(id));
  return { id: Number(id), name };
}

export async function createContact(
  request: APIRequestContext,
  cleanup: CleanupBag,
  overrides: Record<string, unknown> = {},
): Promise<{ id: number; lastname: string }> {
  const lastname = (overrides.lastname as string) ?? uniqueName('pw-contact');
  const id = await apiPost(request, '/contacts', {
    lastname,
    firstname: 'Playwright',
    country_code: 'FR',
    ...overrides,
  });
  cleanup.contacts.unshift(Number(id));
  return { id: Number(id), lastname };
}

export async function createPartnership(
  request: APIRequestContext,
  cleanup: CleanupBag,
  overrides: Record<string, unknown>,
): Promise<number> {
  const id = await apiPost(request, '/partnerships', {
    fk_type: 1,
    date_partnership_start: '2026-06-10',
    ...overrides,
  });
  cleanup.partnerships.unshift(Number(id));
  return Number(id);
}

export async function cleanupRecords(request: APIRequestContext, cleanup: CleanupBag): Promise<void> {
  for (const id of cleanup.partnerships) {
    await apiDelete(request, `/partnerships/${id}`);
  }
  for (const id of cleanup.contacts) {
    await apiDelete(request, `/contacts/${id}`);
  }
  for (const id of cleanup.thirdparties) {
    await apiDelete(request, `/thirdparties/${id}`);
  }
}

export async function submitSearch(field: Locator, value: string): Promise<void> {
  await field.fill(value);
  await field.press('Enter');
}

export async function resetByReload(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expectNoTechnicalError(page);
}

export async function leftMenuLink(page: Page, name: string): Promise<Locator> {
  return page.getByRole('link', { name: new RegExp(`^${escapeRegExp(name)}$`, 'i') }).first();
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function partnershipMenuVisible(page: Page): Promise<boolean> {
  return page.getByRole('link', { name: /partnership/i }).first().isVisible();
}

export async function pageBodyText(page: Page): Promise<string> {
  return (await page.locator('body').innerText()).replace(/\s+/g, ' ');
}
