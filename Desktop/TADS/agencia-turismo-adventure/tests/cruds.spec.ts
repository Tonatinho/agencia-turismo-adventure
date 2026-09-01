import { expect, Page, test } from "@playwright/test";

const emailAdministrador = "admin@adventure.tur.br";
const senhaAdministrador = "Adventure@2026";

function identificadorUnico() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function entrarComoAdministrador(page: Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(emailAdministrador);
  await page.locator('input[type="password"]').fill(senhaAdministrador);
  await page.getByRole("button", { name: "Entrar na minha conta" }).click();
  await expect(page).toHaveURL("/admin");
}

test.describe("CRUDs administrativos (Fluxo E2E Completo via Interface)", () => {
  test("Pacotes: cadastra, lista e arquiva um pacote", async ({ page }) => {
    const sufixo = identificadorUnico();
    const titulo = `Pacote QA ${sufixo}`;

    await entrarComoAdministrador(page);

    const formulario = page.locator("form.booking-form");
    await formulario.getByLabel("Título").fill(titulo);
    await formulario.getByLabel("Destino").fill("Patagônia QA");
    await formulario.getByLabel("Preço").fill("1999.90");
    await formulario.getByLabel("Duração em dias").fill("7");
    await formulario.getByLabel("Descrição").fill("Pacote criado e validado pela automação E2E.");
    await formulario.getByRole("button", { name: "Salvar pacote" }).click();

    await expect(page.locator(".notice")).toHaveText("Pacote cadastrado com sucesso.");
    const linhaPacote = page.locator(".booking-row", { hasText: titulo });
    await expect(linhaPacote).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await linhaPacote.getByText("Arquivar").click();
    await expect(linhaPacote).toHaveCount(0);
  });

  test("Reservas: fluxo do cliente criando reserva e admin atualizando status", async ({ page }) => {
    const sufixo = identificadorUnico();
    const tituloPacote = `Pacote Reserva ${sufixo}`;
    const emailCliente = `qa.reserva.${sufixo}@example.com`;

    await entrarComoAdministrador(page);

    const formulario = page.locator("form.booking-form");
    await formulario.getByLabel("Título").fill(tituloPacote);
    await formulario.getByLabel("Destino").fill("Destino QA");
    await formulario.getByLabel("Preço").fill("1499.90");
    await formulario.getByLabel("Duração em dias").fill("5");
    await formulario.getByLabel("Descrição").fill("Pacote para teste de reserva.");
    await formulario.getByRole("button", { name: "Salvar pacote" }).click();

    await expect(page.locator(".notice")).toHaveText("Pacote cadastrado com sucesso.");

    await page.getByRole("button", { name: "Sair" }).click(); 

    await page.goto("/login");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await page.getByLabel("Nome completo").fill("Cliente Reserva QA");
    await page.getByLabel("E-mail").fill(emailCliente);
    await page.locator('input[type="password"]').fill("Cliente@2026");
    await page.getByRole("button", { name: "Criar minha conta" }).click();

    const pacoteCriado = page.locator(".package-card", { hasText: tituloPacote });
    await expect(pacoteCriado).toBeVisible();
    await pacoteCriado.getByRole("button", { name: "Ver roteiro" }).click();

    await page.getByLabel("Data desejada").fill("2030-12-20");
    await page.getByLabel("Viajantes").fill("2");
    await page.getByRole("button", { name: /Solicitar reserva/i }).click();

    await expect(page.locator(".notice")).toHaveText("Solicitação recebida. Nossa equipe confirmará os próximos passos.");

    await page.getByText(/Olá,/i).click();

    await entrarComoAdministrador(page);


    const linhaReserva = page.locator(".booking-row", { hasText: "Reserva #" }).first();
    await expect(linhaReserva).toBeVisible();

    const selectStatus = linhaReserva.locator("select");
    await expect(selectStatus).toBeVisible();

    await expect(selectStatus).toHaveValue("pendente");

    await selectStatus.selectOption("confirmada");
    await expect(selectStatus).toHaveValue("confirmada");

    await selectStatus.selectOption("cancelada");
    await expect(selectStatus).toHaveValue("cancelada");
  });
});