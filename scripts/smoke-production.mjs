import { readFileSync } from "node:fs";

const base = new URL(process.env.TOOLORA_BASE_URL ?? "https://toolora.gettoolora.workers.dev").origin;
const expectedOrigin = "https://toolora.gettoolora.workers.dev";
if (base !== expectedOrigin) throw new Error("Production smoke checks must target " + expectedOrigin + "; received " + base);

const catalog = readFileSync(new URL("../src/data/tools.ts", import.meta.url), "utf8");
const categoryBlock = catalog.match(/export const categories = \[([\s\S]*?)\] as const/)?.[1] ?? "";
const toolBlock = catalog.match(/export const tools: Tool\[\] = \[([\s\S]*?)\n\];/)?.[1] ?? "";
const categories = [...categoryBlock.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
const tools = [...toolBlock.matchAll(/\{\s*slug:\s*"([^"]+)"/g)].map((match) => match[1]);
if (categories.length !== 9 || tools.length !== 41) {
  throw new Error("Expected 9 categories and 41 tools; found " + categories.length + " categories and " + tools.length + " tools.");
}

const check = async (path, expectedStatus = 200) => {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(20000) });
  if (response.status !== expectedStatus) {
    throw new Error(path + " returned HTTP " + response.status + "; expected " + expectedStatus + ".");
  }
  return response;
};

const homepageResponse = await check("/");
const homepage = await homepageResponse.text();
if (!homepage.includes('<link rel="canonical" href="' + expectedOrigin + '/"')) {
  throw new Error("Homepage canonical URL does not match the production hostname.");
}
if (!homepage.includes("Created by Muhammad Ahmad")) throw new Error("Creator credit is missing from the homepage.");
if (homepage.includes("m-ahmad30212.workers.dev")) throw new Error("Legacy hostname found in the homepage.");
for (const header of ["content-security-policy", "strict-transport-security", "x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy"]) {
  if (!homepageResponse.headers.get(header)) throw new Error("Homepage is missing security header: " + header);
}

const robotsResponse = await check("/robots.txt");
for (const header of ["strict-transport-security", "x-content-type-options", "cross-origin-resource-policy"]) {
  if (!robotsResponse.headers.get(header)) throw new Error("robots.txt is missing security header: " + header);
}
const robots = await robotsResponse.text();
if (!robots.includes("Sitemap: " + expectedOrigin + "/sitemap.xml")) throw new Error("robots.txt does not reference the production sitemap.");

const sitemapResponse = await check("/sitemap.xml");
for (const header of ["strict-transport-security", "x-content-type-options", "cross-origin-resource-policy"]) {
  if (!sitemapResponse.headers.get(header)) throw new Error("sitemap.xml is missing security header: " + header);
}
const sitemap = await sitemapResponse.text();
if (sitemap.includes("m-ahmad30212.workers.dev")) throw new Error("Sitemap contains the legacy hostname.");
for (const slug of categories) if (!sitemap.includes(expectedOrigin + "/categories/" + slug + "/")) throw new Error("Sitemap is missing category " + slug + ".");
for (const slug of tools) if (!sitemap.includes(expectedOrigin + "/tools/" + slug + "/")) throw new Error("Sitemap is missing tool " + slug + ".");
if (!sitemap.includes(expectedOrigin + "/community/")) throw new Error("Sitemap is missing the Community page.");

const healthResponse = await check("/api/health");
const health = await healthResponse.json();
if (health.status !== "ok" || health.community !== "ready") {
  throw new Error("Production API/D1 health check failed: " + JSON.stringify(health));
}
for (const header of ["content-security-policy", "strict-transport-security", "x-content-type-options", "x-frame-options", "cache-control"]) {
  if (!healthResponse.headers.get(header)) throw new Error("API health response is missing security header: " + header);
}

const reviewsResponse = await check("/api/reviews?tool=word-counter");
const reviews = await reviewsResponse.json();
if (!Array.isArray(reviews.reviews) || !reviews.summary || typeof reviews.summary.count !== "number") {
  throw new Error("Community reviews API returned an unexpected response shape.");
}

await check("/admin/", 404);
for (const path of ["/api/admin/login", "/api/admin/session", "/api/admin/pending", "/api/admin/moderate"]) {
  await check(path, 404);
}

const crossOrigin = await fetch(base + "/api/reviews", {
  method: "POST",
  headers: { origin: "https://attacker.invalid", "content-type": "application/json" },
  body: JSON.stringify({ tool: "word-counter", rating: 5, review: "This must not be accepted cross-origin." }),
  signal: AbortSignal.timeout(20000)
});
if (crossOrigin.status !== 403) throw new Error("Cross-origin review submission was not rejected (HTTP " + crossOrigin.status + ").");

const wrongMediaType = await fetch(base + "/api/reviews", {
  method: "POST",
  headers: { origin: expectedOrigin, "content-type": "text/plain" },
  body: JSON.stringify({ tool: "word-counter", rating: 5, review: "This must not be accepted as plain text." }),
  signal: AbortSignal.timeout(20000)
});
if (wrongMediaType.status !== 400) throw new Error("Non-JSON review submission was not rejected (HTTP " + wrongMediaType.status + ").");

const routes = [
  ...categories.map((slug) => "/categories/" + slug + "/"),
  ...tools.map((tool) => "/tools/" + tool + "/"),
  "/search/", "/privacy/", "/terms/", "/community/"
];
let next = 0;
const failures = [];
const worker = async () => {
  while (next < routes.length) {
    const route = routes[next++];
    try {
      const response = await check(route);
      const html = await response.text();
      if (!html.includes('<link rel="canonical" href="' + expectedOrigin + route + '"')) {
        throw new Error("Canonical URL mismatch.");
      }
      if (!html.includes("Created by Muhammad Ahmad")) throw new Error("Creator credit missing.");
      if (html.includes("m-ahmad30212.workers.dev")) throw new Error("Legacy hostname found.");
    } catch (error) {
      failures.push(route + ": " + (error instanceof Error ? error.message : String(error)));
    }
  }
};
await Promise.all(Array.from({ length: 8 }, worker));
if (failures.length) throw new Error("Production route smoke failures:\n" + failures.join("\n"));

console.log("Production smoke checks passed: homepage, security headers, D1 health, community API, moderation isolation, robots, sitemap, 9 categories, 41 tool routes and legal/community pages.");
