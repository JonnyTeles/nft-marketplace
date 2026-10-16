import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); });
});

test('catalog search, category filter, sorting and history restoration', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Explore as obras' })).toBeVisible();
  await page.getByRole('button', { name: '3D', exact: true }).click();
  await expect(page).toHaveURL(/category=3D/);
  await expect(page.getByText('Orbiting Silence')).toBeVisible();
  await page.getByLabel('Ordenar obras').selectOption('price-asc');
  await expect(page).toHaveURL(/sort=price-asc/);
  await page.getByRole('button', { name: 'Todas', exact: true }).click();
  await page.getByLabel('Buscar NFTs').fill('Digital Bloom');
  await expect(page).toHaveURL(/q=Digital\+Bloom|q=Digital%20Bloom/);
  await expect(page.getByText('Digital Bloom')).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel('Buscar NFTs')).toHaveValue('');
});

test('direct NFT detail and add to cart', async ({ page }) => {
  await page.goto('/nft/nft-aurora');
  await expect(page.getByRole('heading', { name: 'Aurora Fragment #08' })).toBeVisible();
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click();
  await page.getByRole('button', { name: /Adicionar ao carrinho/ }).click();
  await expect(page.getByRole('status')).toContainText('adicionada ao carrinho');
  await page.getByRole('link', { name: /Carrinho/ }).click();
  await expect(page.getByText('Aurora Fragment #08')).toBeVisible();
});

test('login and checkout success receipt', async ({ page }) => {
  await page.goto('/nft/nft-aurora');
  await page.getByRole('button', { name: /Adicionar ao carrinho/ }).click();
  await page.goto('/login?redirect=%2Fcheckout');
  await page.getByLabel('E-mail').fill('jonny@demo.com');
  await page.getByLabel('Senha').fill('Demo123!');
  await page.getByRole('button', { name: /^Entrar/ }).click();
  await expect(page).toHaveURL(/checkout/);
  await expect(page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible();
  await page.getByRole('button', { name: /Confirmar compra/ }).click();
  await expect(page.getByRole('heading', { name: 'Sua obra já é sua.' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Confirmado')).toBeVisible();
});

test('invalid login shows accessible error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('jonny@demo.com');
  await page.getByLabel('Senha').fill('wrong-password');
  await page.getByRole('button', { name: /^Entrar/ }).click();
  await expect(page.getByRole('alert')).toContainText('E-mail ou senha inválidos');
});

test('nonexistent NFT displays recovery path', async ({ page }) => {
  await page.goto('/nft/nft-does-not-exist');
  await expect(page.getByRole('alert')).toContainText('não foi encontrado');
  await expect(page.getByRole('link', { name: /Voltar ao catálogo/ })).toBeVisible();
});

test('pending order can be reconciled through the Socket.IO client', async ({ page }) => {
  await page.goto('/nft/nft-aurora');
  await page.getByRole('button', { name: /Adicionar ao carrinho/ }).click();
  await page.goto('/login?redirect=%2Fcheckout');
  await page.getByRole('button', { name: /^Entrar/ }).click();
  await expect(page).toHaveURL(/checkout/);
  await page.getByLabel('Deixar pendente').check();
  await page.getByRole('button', { name: /Confirmar compra/ }).click();
  await expect(page.getByRole('heading', { name: 'Pagamento em processamento' })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Simular confirmação' }).click();
  await expect(page.getByRole('heading', { name: 'Sua obra já é sua.' })).toBeVisible({ timeout: 10_000 });
});

test('profile password change validates and saves the new password', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /^Entrar/ }).click();
  await expect(page.getByRole('heading', { name: 'Minha conta' })).toBeVisible();
  await page.getByLabel('Senha atual').fill('Demo123!');
  await page.getByLabel('Nova senha').fill('NewDemo123!');
  await page.getByRole('button', { name: 'Alterar senha' }).click();
  await expect(page.getByRole('status')).toContainText('Senha alterada com sucesso');
});
