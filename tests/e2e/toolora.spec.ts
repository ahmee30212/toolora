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


test("case converter applies the selected uppercase mode", async ({ page }) => {
  await page.goto("/tools/case-converter/");
  await page.locator("#tool-input").fill("hello toolora");
  await page.locator("#case-mode").selectOption("UPPERCASE");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("HELLO TOOLORA");
});

test("text utilities clean, sort, deduplicate and slugify content", async ({ page }) => {
  await page.goto("/tools/remove-duplicate-lines/");
  await page.locator("#tool-input").fill("Apple\napple\nBanana");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("Apple\nBanana");

  await page.goto("/tools/text-sorter/");
  await page.locator("#tool-input").fill("zebra\napple\nBanana");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("apple\nBanana\nzebra");

  await page.goto("/tools/slug-generator/");
  await page.locator("#tool-input").fill("Café au lait");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("cafe-au-lait");
});

test("text cleaner and analyzer return consistent metrics", async ({ page }) => {
  await page.goto("/tools/text-cleaner/");
  await page.locator("#tool-input").fill("  alpha   beta  \n\n\n gamma ");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("alpha beta\ngamma");

  await page.goto("/tools/text-analyzer/");
  await page.locator("#tool-input").fill("one two. three");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/Words: 3/);
});

test("line diff reports additions and removals", async ({ page }) => {
  await page.goto("/tools/text-diff-checker/");
  await page.locator("#tool-input").fill("alpha\nbeta");
  await page.locator("#compare-text").fill("alpha\ngamma");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/- beta[\s\S]*\+ gamma/);
});

test("base64 converter supports UTF-8 encode and decode", async ({ page }) => {
  await page.goto("/tools/base64-converter/");
  await page.locator("#tool-input").fill("Toolora");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("VG9vbG9yYQ==");
  await page.locator("#tool-input").fill("decode:VG9vbG9yYQ==");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("Toolora");
});

test("HTML encoder escapes markup rather than rendering it", async ({ page }) => {
  await page.goto("/tools/html-encoder-decoder/");
  await page.locator("#tool-input").fill("<script>alert(1)</script>");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("&lt;script&gt;alert(1)&lt;/script&gt;");
});

test("JSON to CSV exports object properties as columns", async ({ page }) => {
  await page.goto("/tools/json-to-csv/");
  await page.locator("#tool-input").fill('[{"name":"Ahmad","city":"Islamabad"}]');
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("name,city\nAhmad,Islamabad");
});

test("keyword density and number-system conversion calculate expected values", async ({ page }) => {
  await page.goto("/tools/keyword-density-checker/");
  await page.locator("#tool-input").fill("toolora toolora toolora");
  await page.locator("#keyword").fill("toolora");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/Density: 100.00%/);

  await page.goto("/tools/number-system-converter/");
  await page.locator("#tool-input").fill("255");
  await page.locator("#to-base").fill("16");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("FF");
});

test("Unix timestamp converter accepts both ISO dates and numeric timestamps", async ({ page }) => {
  await page.goto("/tools/unix-timestamp-converter/");
  await page.locator("#tool-input").fill("2024-01-01T00:00:00Z");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/ISO: 2024-01-01T00:00:00.000Z/);
  await page.locator("#tool-input").fill("1704067200");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/ISO: 2024-01-01T00:00:00.000Z/);
});

test("age calculator parses calendar dates in local time", async ({ page }) => {
  await page.goto("/tools/age-calculator/");
  await page.locator("#dob").fill("2000-01-01");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/years, .* months and .* days/);
});

test("BMI and percentage calculators produce numeric results", async ({ page }) => {
  await page.goto("/tools/bmi-calculator/");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/BMI: 22.9/);

  await page.goto("/tools/percentage-calculator/");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/15% of 200 = 30/);
});

test("password generator uses the requested length and cryptographic API", async ({ page }) => {
  await page.goto("/tools/password-generator/");
  await page.locator("#pass-length").fill("24");
  await page.getByRole("button", { name: /run tool/i }).click();
  const result = await page.locator("#tool-output").inputValue();
  expect(result).toHaveLength(24);
  await expect(page.locator("#result-meta")).toContainText("Web Crypto");
});

test("URL, binary and XML utilities process valid data", async ({ page }) => {
  await page.goto("/tools/url-encoder-decoder/");
  await page.locator("#tool-input").fill("hello world");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("hello%20world");
  await page.locator("#tool-input").fill("decode:hello%20world");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("hello world");

  await page.goto("/tools/text-binary-converter/");
  await page.locator("#tool-input").fill("Hi");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("01001000 01101001");

  await page.goto("/tools/xml-formatter/");
  await page.locator("#tool-input").fill("<root><item>1</item></root>");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue("<root>\n<item>1</item>\n</root>");
});

test("UUID generator creates ten valid UUID v4 values", async ({ page }) => {
  await page.goto("/tools/uuid-generator/");
  await page.getByRole("button", { name: /run tool/i }).click();
  const result = await page.locator("#tool-output").inputValue();
  const values = result.split("\n");
  expect(values).toHaveLength(10);
  for (const value of values) expect(value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test("social and design generators return usable output", async ({ page }) => {
  await page.goto("/tools/color-picker/");
  await page.locator("#tool-input").fill("#ff0000");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/RGB: rgb\(255, 0, 0\)/);

  await page.goto("/tools/gradient-generator/");
  await page.locator("#tool-input").fill("#ff0000, #0000ff");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/linear-gradient/);

  await page.goto("/tools/hashtag-generator/");
  await page.locator("#tool-input").fill("Travel Photography");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/#travel #photography/);

  await page.goto("/tools/caption-generator/");
  await page.locator("#tool-input").fill("A sunny day");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/A sunny day/);
});

test("image resizer preserves aspect ratio when only one dimension is supplied", async ({ page }) => {
  await page.goto("/tools/image-resizer/");
  const pngBase64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable in browser test.");
    context.fillStyle = "#2563eb";
    context.fillRect(0, 0, 4, 2);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page.locator("#file-input").setInputFiles({ name: "ratio.png", mimeType: "image/png", buffer: Buffer.from(pngBase64, "base64") });
  await page.locator("#image-width").fill("8");
  await page.locator("#image-height").fill("0");
  await page.getByRole("button", { name: /run tool/i }).click();
  await expect(page.locator("#tool-output")).toHaveValue(/Output: 8 × 4/);
});


test("search filters the tool catalog on the client and updates the query URL", async ({ page }) => {
  await page.goto("/search/?q=word");
  await expect(page.locator("#search-summary")).toContainText("result(s) for");
  await expect(page.locator('#search-results a[href="/tools/word-counter/"]')).toBeVisible();
  await page.locator("#tool-search-input").fill("PDF");
  await expect(page.locator("#search-results .tool-row").first()).toBeVisible();
  await page.getByRole("button", { name: /search/i }).click();
  await expect(page).toHaveURL(/q=PDF/);
  await page.locator("#tool-search-input").fill("zzzz-no-tool-match");
  await expect(page.locator("#search-state-title")).toHaveText("No matching tools found");
});

test("internal navigation uses canonical trailing-slash routes", async ({ page }) => {
  await page.goto("/");
  const nonCanonical = await page.locator('a[href^="/categories/"], a[href^="/tools/"], a[href^="/search"], a[href^="/privacy"], a[href^="/terms"]').evaluateAll((links) =>
    links.map((link) => new URL((link as HTMLAnchorElement).href).pathname).filter((path) => !path.endsWith("/"))
  );
  expect(nonCanonical).toEqual([]);
});
