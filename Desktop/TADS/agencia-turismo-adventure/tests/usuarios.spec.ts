import { expect, test } from "@playwright/test";

const senha = "Adventure@2026";

function emailUnico() {
  return `qa.usuario.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
}

test.describe("Cadastro de usuários", () => {
  test("cria um usuário com sucesso", async ({ page }) => {
    const email = emailUnico();

    await page.goto("/login");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await page.getByLabel("Nome completo").fill("Usuário QA");
    await page.getByLabel("E-mail").fill(email);
    await page.locator('input[type="password"]').fill(senha);
    await page.getByRole("button", { name: "Criar minha conta" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: /Olá, Usuário/ })).toBeVisible();
  });

  test("impede o cadastro com e-mail já utilizado", async ({ page }) => {
    const email = emailUnico();

    await page.goto("/login");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await page.getByLabel("Nome completo").fill("Primeiro Usuário QA");
    await page.getByLabel("E-mail").fill(email);
    await page.locator('input[type="password"]').fill(senha);
    await page.getByRole("button", { name: "Criar minha conta" }).click();
    await expect(page).toHaveURL("/");

    await page.getByRole("button", { name: /Olá, Primeiro/ }).click();
    await page.goto("/login");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await page.getByLabel("Nome completo").fill("Segundo Usuário QA");
    await page.getByLabel("E-mail").fill(email);
    await page.locator('input[type="password"]').fill(senha);
    await page.getByRole("button", { name: "Criar minha conta" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.locator(".form-error")).toHaveText("E-mail já cadastrado");
  });
});
