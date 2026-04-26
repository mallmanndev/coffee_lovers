import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Coffee Registration", () => {
  test.beforeEach(async ({ page }) => {
    // Real login flow since backend is real and doesn't accept fake tokens
    const email = `test-${Date.now()}@example.com`;
    const password = "Password123!";

    // Register
    await page.goto("/register");
    await page.getByLabel("Nome completo").fill("Test User");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Cidade").fill("São Paulo");
    await page.getByLabel("Estado (UF)").fill("SP");
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByLabel("Confirmar Senha").fill(password);
    await page.getByRole("button", { name: "Criar conta" }).click();

    // Login
    await page.waitForURL(/\/login\?registered=true/);
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL(/\/feed/);
  });

  test("should register a new coffee with an image", async ({ page }) => {
    // 1. Navigate to stock page
    await page.goto("/stock");

    // 3. Open registration modal
    await expect(
      page.getByRole("heading", { name: "Cafés", level: 1 })
    ).toBeVisible();
    await page.getByRole("button", { name: "Novo café" }).click();

    // 4. Fill in basic information
    const coffeeName = `Test Coffee ${Date.now()}`;
    await page.getByLabel("Nome do café *").fill(coffeeName);
    await page.getByLabel("Torrefação *").fill("Test Roastery");
    await page.getByLabel("Fazenda / Produtor").fill("Test Farm");

    // 5. Upload image
    const filePath = path.join(__dirname, "fixtures/coffee-test.png");
    await page.getByLabel("Fotos (opcional)").setInputFiles(filePath);

    // Wait for upload to complete (button text changes from "Enviando…" back to "Adicionar fotos")
    // or wait for the image to appear in the list
    await expect(page.getByRole("button", { name: "Adicionar fotos" })).toBeEnabled();
    await expect(page.locator("ul.grid li img")).toBeVisible();

    // 6. Fill in origin information
    await page.getByLabel("País").fill("Brasil");
    await page.getByLabel("Região").fill("Mantiqueira");
    await page.getByLabel("Variedade").fill("Geisha");
    await page.getByLabel("Altitude (metros)").fill("1300");

    // 7. Fill in processing details
    await page.getByLabel("Método de processamento").fill("Natural");
    await page.getByLabel("Detalhes de fermentação").fill("72h Anaeróbico");
    await page.getByLabel("Método de secagem").fill("Terreiro suspenso");

    // 8. Fill in roast profile
    await page.getByLabel("Perfil de torra").fill("Média");

    // 9. Fill in sensory profile
    await page.getByLabel("Notas sensoriais").fill("Frutas tropicais, jasmin");
    await page.getByLabel("Acidez").fill("Alta");
    await page.getByLabel("Corpo").fill("Sedoso");
    await page.getByLabel("Doçura").fill("Alta");
    await page.getByLabel("Final").fill("Longo");
    await page.getByLabel("Pontuação SCA").fill("89.5");

    // 10. Submit form
    await page.getByRole("button", { name: "Cadastrar café" }).click();

    // 11. Verify modal closed and new coffee appears in the list
    await expect(page.getByRole("heading", { name: "Cadastrar café" })).not.toBeVisible();
    
    // Check if the new coffee is in the list
    const coffeeCard = page.locator("div.grid.gap-4").filter({ hasText: coffeeName });
    await expect(coffeeCard).toBeVisible();
    await expect(coffeeCard).toContainText("Test Roastery");
    await expect(coffeeCard).toContainText("SCA 89.5");
  });

  test("should show validation errors for required fields", async ({ page }) => {
    await page.goto("/stock");
    await page.getByRole("button", { name: "Novo café" }).click();

    // Submit without filling required fields
    await page.getByRole("button", { name: "Cadastrar café" }).click();

    // Check for error messages
    await expect(page.getByText("Nome é obrigatório")).toBeVisible();
    await expect(page.getByText("Torrefação é obrigatória")).toBeVisible();
  });
});
