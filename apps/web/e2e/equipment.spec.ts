import { test, expect } from "@playwright/test";
import { seedAuthedSession } from "./helpers/authed-navigation";

test.describe("Equipment page", () => {
  test("should show title and open registration modal with form fields", async ({
    page,
  }) => {
    await seedAuthedSession(page);
    await page.goto("/equipment");

    await expect(
      page.getByRole("heading", { name: "Equipamentos", level: 1 })
    ).toBeVisible();

    await page.getByRole("button", { name: "Novo equipamento" }).click();

    await expect(
      page.getByRole("heading", { name: "Cadastrar equipamento" })
    ).toBeVisible();

    await expect(page.getByLabel("Equipamento base (catálogo)")).toBeVisible();
    await expect(page.getByLabel("Tipo")).toBeVisible();
    await expect(page.getByLabel("Nome")).toBeVisible();
    await expect(page.getByLabel("Marca")).toBeVisible();
    await expect(page.getByLabel("Modelo")).toBeVisible();
    await expect(page.getByLabel("Descrição (opcional)")).toBeVisible();
    await expect(page.getByLabel("Fotos (opcional)")).toBeVisible();
  });
});
