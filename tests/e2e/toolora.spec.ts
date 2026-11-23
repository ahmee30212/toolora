import { test, expect } from "@playwright/test";
import { categories, tools } from "../../src/data/tools";

test("homepage and mobile navigation are branded and usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page).toHaveTitle(/Toolora/);
  await expect(page.locator(".site-header .brand-lockup")).toBeVisible();
  await expect(page.getByText("Created by Muhammad Ahmad ❤️")).toBeVisible();
  const menu = page.locator(".mobile-menu summary");
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Search tools" })).toBeVisible();
});

for (const category of categories) {
  test(`category ${category.slug} shows its own tools`, async ({ page }) => {
    await page.goto(`/categories/${category.slug}/`);
    await expect(page.getByRole("heading", { level: 1, name: category.name })).toBeVisible();
    const expected = tools.filter((tool) => tool.category === category.slug);
    await expect(page.locator(".tool-row")).toHaveCount(expected.length);
    for (const tool of expected) await expect(page.getByRole("link", { name: new RegExp(tool.name) })).toBeVisible();
  });
}

for (const tool of tools) {
  test(`tool workspace loads: ${tool.slug}`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`/tools/${tool.slug}/`);
    await expect(page.getByRole("heading", { level: 1, name: tool.name })).toBeVisible();
    await expect(page.locator("#tool-form")).toHaveAttribute("data-tool", tool.slug);
    await expect(page.getByRole("button", { name: /run tool/i })).toBeVisible();
    await expect(page.locator("#tool-status")).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
}

test("word counter processes text and exposes the result", async ({ page }) => {
  await page.goto("/tools/word-counter/");
  await page.locator("#tool-input").fill("Toolora makes useful tools");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/Words: 4/);
});

test("JSON formatter returns valid formatted JSON", async ({ page }) => {
  await page.goto("/tools/json-formatter/");
  await page.locator("#tool-input").fill('{"toolora":true,"count":41}');
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/"toolora": true/);
});

test("CSV to JSON converts quoted columns", async ({ page }) => {
  await page.goto("/tools/csv-to-json/");
  await page.locator("#tool-input").fill('name,city\n"Ahmad, A.","Islamabad"');
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/Ahmad, A\./);
});

test("Markdown preview escapes untrusted HTML", async ({ page }) => {
  await page.goto("/tools/markdown-editor/");
  await page.locator("#tool-input").fill("# Safe heading\n<img src=x onerror=alert(1)>");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#markdown-preview h1")).toHaveText("Safe heading");
  await expect(page.locator("#markdown-preview img")).toHaveCount(0);
  await expect(page.locator("#markdown-preview")).toContainText("<img src=x onerror=alert(1)>");
});

test("image compressor handles a small local PNG", async ({ page }) => {
  await page.goto("/tools/image-compressor/");
  const pngBase64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable in browser test.");
    context.fillStyle = "#e11d48";
    context.fillRect(0, 0, 2, 2);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  const png = Buffer.from(pngBase64, "base64");
  await page.locator("#file-input").setInputFiles({ name: "tiny.png", mimeType: "image/png", buffer: png });
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-status")).toContainText("Image processed locally", { timeout: 15000 });
  await expect(page.locator("#tool-output")).toHaveValue(/Original:/);
});

test("privacy and terms pages are accessible from the footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy");
  await expect(page.getByRole("link", { name: "Terms of use" })).toHaveAttribute("href", "/terms");
  await page.goto("/privacy/");
  await expect(page.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeVisible();
  await page.goto("/terms/");
  await expect(page.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeVisible();
});
