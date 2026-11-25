import { test, expect } from "@playwright/test";
import { tools } from "../../src/data/tools";

test.describe("all catalog tool workspaces", () => {
  for (const tool of tools) {
    test(`renders a working workspace for ${tool.name} (${tool.slug})`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      const response = await page.goto(`/tools/${tool.slug}/`);
      expect(response?.ok(), `route /tools/${tool.slug}/ should load`).toBeTruthy();
      await expect(page.getByRole("heading", { name: tool.name, level: 1 })).toBeVisible();
      await expect(page.locator("#tool-form")).toHaveAttribute("data-tool", tool.slug);
      await expect(page.locator("#tool-input")).toHaveCount(1);
      await expect(page.locator("#tool-output")).toHaveCount(1);
      await expect(page.locator("#run-tool")).toBeVisible();
      await expect(page.locator("#reset-tool")).toBeVisible();
      await expect(page.locator("#copy-result")).toBeVisible();
      await expect(page.locator("#download-result")).toBeVisible();

      // Allow the page module and any local event wiring to finish before checking runtime errors.
      await expect(page.locator("#tool-status")).toBeVisible();
      expect(pageErrors, `runtime errors on /tools/${tool.slug}/`).toEqual([]);
    });
  }
});

test.describe("representative tool execution", () => {
  test("word counter produces a result", async ({ page }) => {
    await page.goto("/tools/word-counter/");
    await page.locator("#tool-input").fill("Toolora makes useful tools.");
    await page.locator("#run-tool").click();
    await expect(page.locator("#tool-output")).toContainText("Words: 4");
    await expect(page.locator("#tool-status")).toContainText("Completed successfully.");
  });

  test("JSON formatter validates and formats JSON", async ({ page }) => {
    await page.goto("/tools/json-formatter/");
    await page.locator("#tool-input").fill('{"toolora":true,"count":41}');
    await page.locator("#run-tool").click();
    await expect(page.locator("#tool-output")).toContainText('"toolora": true');
    await expect(page.locator("#tool-output")).toContainText('"count": 41');
  });

  test("invalid JSON reports a readable validation error", async ({ page }) => {
    await page.goto("/tools/json-formatter/");
    await page.locator("#tool-input").fill("{invalid");
    await page.locator("#run-tool").click();
    await expect(page.locator("#tool-status")).toContainText("Expected property name");
  });

  test("reset clears input and output", async ({ page }) => {
    await page.goto("/tools/word-counter/");
    await page.locator("#tool-input").fill("Reset this content");
    await page.locator("#run-tool").click();
    await expect(page.locator("#tool-output")).not.toBeEmpty();
    await page.locator("#reset-tool").click();
    await expect(page.locator("#tool-input")).toHaveValue("");
    await expect(page.locator("#tool-output")).toHaveValue("");
  });
});
