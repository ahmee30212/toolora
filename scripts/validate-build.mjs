import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../dist/", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const catalog = readFileSync(new URL("../src/data/tools.ts", import.meta.url), "utf8");
const categoryBlock = catalog.match(/export const categories = \[([\s\S]*?)\] as const/)?.[1] ?? "";
const toolBlock = catalog.match(/export const tools: Tool\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? "";
const categories = [...categoryBlock.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const tools = [...toolBlock.matchAll(/\{\s*slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const routes = [
  "index.html", "search/index.html", "privacy/index.html", "terms/index.html", "404.html",
  ...categories.map((slug) => `categories/${slug}/index.html`),
  ...tools.map((slug) => `tools/${slug}/index.html`)
];
const failures = [];
for (const route of routes) {
  const path = new URL(route, root);
  if (!existsSync(path)) {
    failures.push(`Missing generated route: /${route}`);
    continue;
  }
  const html = read(route);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`Missing title: /${route}`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) failures.push(`Missing meta description: /${route}`);
  if (!/<link rel="canonical" href="https:\/\//.test(html)) failures.push(`Missing canonical URL: /${route}`);
  if (!html.includes("Created by Muhammad Ahmad")) failures.push(`Missing creator credit: /${route}`);
}
const sitemap = read("sitemap.xml");
for (const slug of categories) if (!sitemap.includes(`/categories/${slug}`)) failures.push(`Sitemap missing category: ${slug}`);
for (const slug of tools) if (!sitemap.includes(`/tools/${slug}`)) failures.push(`Sitemap missing tool: ${slug}`);
const headers = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
for (const directive of ["Content-Security-Policy:", "Strict-Transport-Security:", "X-Content-Type-Options:", "Referrer-Policy:"]) {
  if (!headers.includes(directive)) failures.push(`Missing security header: ${directive}`);
}
if (failures.length) throw new Error(failures.join("\n"));
console.log(`Production output verified: ${routes.length} branded routes, sitemap coverage, canonical metadata and security headers.`);
