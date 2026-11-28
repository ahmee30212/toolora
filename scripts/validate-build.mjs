import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";

const root = new URL("../dist/", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const catalog = readFileSync(new URL("../src/data/tools.ts", import.meta.url), "utf8");
const categoryBlock = catalog.match(/export const categories = \[([\s\S]*?)\] as const/)?.[1] ?? "";
const toolBlock = catalog.match(/export const tools: Tool\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? "";
const categories = [...categoryBlock.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const tools = [...toolBlock.matchAll(/\{\s*slug:\s*"([^"]+)"/g)].map((m) => m[1]);
const canonicalOrigin = "https://toolora.gettoolora.workers.dev";
const routes = [
  "index.html", "about/index.html", "search/index.html", "privacy/index.html", "terms/index.html", "community/index.html", "services/index.html", "disclosure/index.html", "partners/ezitech/index.html", "404.html",
  ...categories.map((slug) => "categories/" + slug + "/index.html"),
  ...tools.map((slug) => "tools/" + slug + "/index.html")
];
const failures = [];
for (const route of routes) {
  const path = new URL(route, root);
  if (!existsSync(path)) {
    failures.push("Missing generated route: /" + route);
    continue;
  }
  const html = read(route);
  if (!/<title>[^<]+<\/title>/.test(html)) failures.push("Missing title: /" + route);
  if (!/<meta name="description" content="[^"]+"/.test(html)) failures.push("Missing meta description: /" + route);
  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!schemaMatch) {
    failures.push("Missing JSON-LD structured data: /" + route);
  } else {
    try {
      const schema = JSON.parse(schemaMatch[1]);
      const graph = schema["@graph"] ?? [];
      const types = graph.map((entry) => entry["@type"]);
      if (schema["@context"] !== "https://schema.org" || !types.includes("Organization") || !types.includes("WebSite") || !types.includes("WebPage")) {
        failures.push("Missing expected Organization, WebSite or WebPage schema: /" + route);
      }
      const page = graph.find((entry) => entry["@type"] === "WebPage");
      if (route.startsWith("tools/")) {
        const application = graph.find((entry) => entry["@type"] === "SoftwareApplication");
        if (!application || application.applicationCategory !== "UtilitiesApplication" || application.offers?.price !== "0" || !application.name || !application.description) {
          failures.push("Missing or invalid free SoftwareApplication structured data: /" + route);
        }
      }
      const expectsBreadcrumbs = route.startsWith("categories/") || route.startsWith("tools/");
      const breadcrumb = graph.find((entry) => entry["@type"] === "BreadcrumbList");
      if (expectsBreadcrumbs) {
        const items = breadcrumb?.itemListElement ?? [];
        if (!breadcrumb || items.length < 2 || items.some((item, index) => item["@type"] !== "ListItem" || item.position !== index + 1 || !item.name || !item.item)) {
          failures.push("Missing or invalid breadcrumb structured data: /" + route);
        }
      } else if (breadcrumb) {
        failures.push("Unexpected breadcrumb structured data on route without breadcrumbs: /" + route);
      }
      const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
      if (!page || !canonicalMatch || page.url !== canonicalMatch[1] || !page.name || !page.description) {
        failures.push("WebPage schema does not match canonical metadata: /" + route);
      }
    } catch {
      failures.push("Invalid JSON-LD structured data: /" + route);
    }
  }
  if (route === "search/index.html" && !/<meta name="robots" content="noindex, follow"/.test(html)) failures.push("Internal search page must remain noindex, follow.");
  if (!/<link rel="canonical" href="https:\/\//.test(html)) failures.push("Missing canonical URL: /" + route);
  if (!html.includes('href="' + canonicalOrigin + '/')) failures.push("Canonical URL does not use the production hostname: /" + route);
  if (html.includes("m-ahmad30212.workers.dev")) failures.push("Legacy hostname found in generated HTML: /" + route);
  if (!/<meta name="viewport" content="width=device-width, initial-scale=1"/.test(html)) failures.push("Missing responsive viewport: /" + route);
  if ((html.match(/<h1(?:\s|>)/g) ?? []).length !== 1) failures.push("Expected exactly one primary heading: /" + route);
  if (/\sstyle\s*=|<style(?:\s|>)/i.test(html)) failures.push("Inline styles violate the strict style CSP: /" + route);
  if (/https?:\/\/fonts\.(?:googleapis|gstatic)\.com/i.test(html)) failures.push("Unexpected third-party font request: /" + route);
  if (!html.includes("Created by Muhammad Ahmad")) failures.push("Missing creator credit: /" + route);
}
const sitemap = read("sitemap.xml");
const expectedSitemapPaths = [
  "/", "/about/", "/privacy/", "/terms/", "/community/", "/services/", "/disclosure/", "/partners/ezitech/",
  ...categories.map((slug) => "/categories/" + slug + "/"),
  ...tools.map((slug) => "/tools/" + slug + "/")
];
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedSitemapLocations = expectedSitemapPaths.map((path) => canonicalOrigin + path);
if (!sitemap.includes('<?xml version="1.0" encoding="UTF-8"?>') || !sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
  failures.push("Sitemap is missing its XML declaration or sitemap namespace.");
}
if (sitemapLocations.length !== expectedSitemapLocations.length) {
  failures.push("Sitemap URL count does not match the expected canonical route count: found " + sitemapLocations.length + ", expected " + expectedSitemapLocations.length + ".");
}
const duplicateSitemapLocations = sitemapLocations.filter((location, index) => sitemapLocations.indexOf(location) !== index);
if (duplicateSitemapLocations.length) failures.push("Sitemap contains duplicate URLs: " + [...new Set(duplicateSitemapLocations)].join(", "));
const actualSitemapSet = new Set(sitemapLocations);
for (const location of expectedSitemapLocations) {
  if (!actualSitemapSet.has(location)) failures.push("Sitemap is missing canonical URL: " + location);
}
for (const location of sitemapLocations) {
  if (!expectedSitemapLocations.includes(location)) failures.push("Sitemap contains an unexpected or non-canonical URL: " + location);
}
if (sitemap.includes("<loc>" + canonicalOrigin + "/search/</loc>")) failures.push("Noindex internal search page must not be included in the sitemap.");
if (sitemap.includes("m-ahmad30212.workers.dev")) failures.push("Sitemap contains the legacy hostname.");
const robots = read("robots.txt");
if (!robots.includes("Sitemap: " + canonicalOrigin + "/sitemap.xml")) failures.push("robots.txt does not reference the production sitemap.");
if (existsSync(new URL("admin/index.html", root))) failures.push("Retired admin dashboard route must not be published.");
const assetsRoot = new URL("_astro/", root);
if (existsSync(assetsRoot)) {
  const assets = readdirSync(assetsRoot, { withFileTypes: true }).filter((entry) => entry.isFile());
  const jsBytes = assets.filter((entry) => entry.name.endsWith(".js")).reduce((sum, entry) => sum + statSync(new URL(entry.name, assetsRoot)).size, 0);
  const cssBytes = assets.filter((entry) => entry.name.endsWith(".css")).reduce((sum, entry) => sum + statSync(new URL(entry.name, assetsRoot)).size, 0);
  if (jsBytes > 4 * 1024 * 1024) failures.push("JavaScript asset budget exceeded: " + jsBytes + " bytes (4 MiB maximum).");
  if (cssBytes > 250 * 1024) failures.push("CSS asset budget exceeded: " + cssBytes + " bytes (250 KiB maximum).");
  const largestJs = Math.max(0, ...assets.filter((entry) => entry.name.endsWith(".js")).map((entry) => statSync(new URL(entry.name, assetsRoot)).size));
  if (largestJs > 3 * 1024 * 1024) failures.push("A JavaScript chunk exceeds the 3 MiB per-file budget: " + largestJs + " bytes.");
  console.log("Asset budgets: JavaScript " + Math.ceil(jsBytes / 1024) + " KiB / 4096 KiB; CSS " + Math.ceil(cssBytes / 1024) + " KiB / 250 KiB; largest JS chunk " + Math.ceil(largestJs / 1024) + " KiB / 3072 KiB.");
}
const pdfRuntimeRoot = new URL("pdfjs/", root);
const pdfRuntimeFolders = ["cmaps", "iccs", "image_decoders", "standard_fonts", "wasm"];
const folderBytes = (directory) => readdirSync(directory, { withFileTypes: true }).reduce((sum, entry) => {
  const entryUrl = new URL(entry.name + (entry.isDirectory() ? "/" : ""), directory);
  return sum + (entry.isDirectory() ? folderBytes(entryUrl) : statSync(entryUrl).size);
}, 0);
let pdfRuntimeBytes = 0;
for (const folder of pdfRuntimeFolders) {
  const folderUrl = new URL(folder + "/", pdfRuntimeRoot);
  if (!existsSync(folderUrl)) failures.push("Missing local PDF.js runtime assets: " + folder);
  else pdfRuntimeBytes += folderBytes(folderUrl);
}
if (pdfRuntimeBytes > 8 * 1024 * 1024) failures.push("PDF.js runtime data exceeds the 8 MiB budget: " + pdfRuntimeBytes + " bytes.");
console.log("Local PDF.js runtime data: " + Math.ceil(pdfRuntimeBytes / 1024) + " KiB / 8192 KiB.");
const headers = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
for (const directive of [
  "Content-Security-Policy:", "Strict-Transport-Security:", "X-Content-Type-Options:",
  "Referrer-Policy:", "Permissions-Policy:", "Cross-Origin-Opener-Policy:",
  "Cross-Origin-Embedder-Policy:", "Cross-Origin-Resource-Policy:", "Origin-Agent-Cluster:"
]) {
  if (!headers.includes(directive)) failures.push("Missing security header: " + directive);
}
const csp = headers.split("\n").find((line) => line.trimStart().startsWith("Content-Security-Policy:")) ?? "";
for (const forbidden of ["'unsafe-inline'", "'unsafe-eval'", "*"]) {
  if (csp.includes(forbidden)) failures.push("Weak Content Security Policy directive detected: " + forbidden);
}
for (const required of [
  "default-src 'self'", "object-src 'none'", "frame-ancestors 'none'",
  "script-src 'self' https://cdnjs.cloudflare.com", "style-src 'self'", "style-src-attr 'none'"
]) {
  if (!csp.includes(required)) failures.push("CSP is missing required directive: " + required);
}
if (failures.length) throw new Error(failures.join("\n"));
console.log("Production output verified: " + routes.length + " branded routes, sitemap coverage, canonical metadata and strict security headers.");
