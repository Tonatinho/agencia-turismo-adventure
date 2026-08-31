import { test, expect } from '@playwright/test';

test.describe('Fluxo de Login', () => {
  test('Login com credenciais inválidas (Falha)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'errado@email.com');
    await page.fill('input[type="password"]', 'senhaerrada');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible(); 
  });

  test('Login de Administrador (Sucesso)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@adventure.tur.br');
    await page.fill('input[type="password"]', 'Adventure@2026');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin');
  });
});
